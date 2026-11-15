/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import schema from "../convex/schema";
import { GAME_DURATION_MS, RETENTION_AFTER_DEADLINE_MS } from "../convex/constants";

const modules = import.meta.glob("../convex/**/*.ts");

let tokenCounter = 0;
function newToken(): string {
  tokenCounter++;
  return tokenCounter.toString(16).padStart(64, "0");
}

const fixtureChallenges = (["easy", "medium", "hard"] as const).flatMap((difficulty) =>
  Array.from({ length: 6 }, (_, i) => ({
    key: `${difficulty}_${i}`,
    description: `${difficulty} challenge ${i}`,
    difficulty,
    category: "general",
    environments: [],
    enabled: true,
  })),
);
const fixturePunishments = [{ key: "punishment_0", description: "Do a dance", category: "general", enabled: true }];

async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.content.importContent, { challenges: fixtureChallenges, punishments: fixturePunishments });
  return t;
}

type T = Awaited<ReturnType<typeof setup>>;

async function twoTeamRoom(t: T) {
  const host = newToken();
  const guest = newToken();
  const { roomCode } = await t.mutation(api.rooms.createRoom, { name: "Hosts", sessionToken: host });
  await t.mutation(api.rooms.joinRoom, { code: roomCode.toLowerCase(), name: "Guests", sessionToken: guest });
  return { host, guest, roomCode };
}

async function upload(t: T, type: string, bytes = 10): Promise<Id<"_storage">> {
  return await t.run(async (ctx) => ctx.storage.store(new Blob([new Uint8Array(bytes)], { type })));
}

async function submitPhoto(t: T, token: string, assignmentId: Id<"assignments">) {
  const storageId = await upload(t, "image/jpeg");
  return await t.mutation(api.game.submitEvidence, {
    sessionToken: token,
    assignmentId,
    storageId,
    mediaType: "photo",
    mimeType: "image/jpeg",
  });
}

async function completeAll(t: T, token: string) {
  const game = await t.query(api.game.getGame, { sessionToken: token });
  for (const a of game.assignments) await submitPhoto(t, token, a.id);
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("lobby", () => {
  it("only the host can start, and only with two teams", async () => {
    const t = await setup();
    const host = newToken();
    const { roomCode } = await t.mutation(api.rooms.createRoom, { name: "Solo", sessionToken: host });
    await expect(t.mutation(api.rooms.startGame, { sessionToken: host })).rejects.toThrow(/At least 2 teams/);

    const guest = newToken();
    await t.mutation(api.rooms.joinRoom, { code: roomCode, name: "Guests", sessionToken: guest });
    await expect(t.mutation(api.rooms.startGame, { sessionToken: guest })).rejects.toThrow(/Only the host/);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
  });

  it("is idempotent for repeated create and join taps", async () => {
    const t = await setup();
    const host = newToken();
    const a = await t.mutation(api.rooms.createRoom, { name: "Hosts", sessionToken: host });
    const b = await t.mutation(api.rooms.createRoom, { name: "Hosts", sessionToken: host });
    expect(b).toEqual(a);
    const guest = newToken();
    const j1 = await t.mutation(api.rooms.joinRoom, { code: a.roomCode, name: "G", sessionToken: guest });
    const j2 = await t.mutation(api.rooms.joinRoom, { code: a.roomCode, name: "G", sessionToken: guest });
    expect(j2).toEqual(j1);
    const lobby = await t.query(api.rooms.getLobby, { sessionToken: host });
    expect(lobby.teams).toHaveLength(2);
  });

  it("rejects unknown codes and late joins", async () => {
    const t = await setup();
    await expect(t.mutation(api.rooms.joinRoom, { code: "ZZZZZZ", name: "X", sessionToken: newToken() })).rejects.toThrow(/No room/);
    const { host, roomCode } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    expect(await t.query(api.rooms.lookupLobby, { code: roomCode })).toEqual({ status: "started" });
    await expect(t.mutation(api.rooms.joinRoom, { code: roomCode, name: "Late", sessionToken: newToken() })).rejects.toThrow(/already started/);
  });

  it("lets only the host set the punishment and shows it to everyone", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await expect(t.mutation(api.rooms.setPunishment, { sessionToken: guest, kind: "skip" })).rejects.toThrow(/Only the host/);
    await t.mutation(api.rooms.setPunishment, { sessionToken: host, kind: "custom", customText: "  Do a dance  " });
    const lobby = await t.query(api.rooms.getLobby, { sessionToken: guest });
    expect(lobby.punishment).toEqual({ kind: "custom", text: "Do a dance" });
  });

  it("keeps the lobby intact when there aren't enough challenges", async () => {
    const t = await setup();
    await t.run(async (ctx) => {
      const hard = await ctx.db.query("challenges").filter((q) => q.eq(q.field("difficulty"), "hard")).collect();
      for (const c of hard.slice(1)) await ctx.db.patch("challenges", c._id, { enabled: false });
    });
    const { host } = await twoTeamRoom(t);
    await expect(t.mutation(api.rooms.startGame, { sessionToken: host })).rejects.toThrow(/enough hard/);
    const session = await t.query(api.rooms.getSession, { sessionToken: host });
    expect(session.state).toBe("lobby");
    const count = await t.run(async (ctx) => (await ctx.db.query("assignments").collect()).length);
    expect(count).toBe(0);
  });
});

describe("game", () => {
  it("assigns distinct easy/medium/hard challenges with a shared deadline", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    const a = await t.query(api.game.getGame, { sessionToken: host });
    const b = await t.query(api.game.getGame, { sessionToken: guest });
    expect(a.endsAt).toBe(b.endsAt);
    expect(a.assignments.map((x) => x.difficulty)).toEqual(["easy", "medium", "hard"]);
    expect(b.assignments.map((x) => x.difficulty)).toEqual(["easy", "medium", "hard"]);
    const all = [...a.assignments, ...b.assignments].map((x) => x.description);
    expect(new Set(all).size).toBe(6);
  });

  it("counts one submission per assignment and hides proof during play", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    const game = await t.query(api.game.getGame, { sessionToken: host });
    const first = game.assignments[0].id;

    const storageId = await upload(t, "image/jpeg");
    const args = { sessionToken: host, assignmentId: first, storageId, mediaType: "photo" as const, mimeType: "image/jpeg" };
    expect(await t.mutation(api.game.submitEvidence, args)).toMatchObject({ ok: true, completedCount: 1 });
    expect(await t.mutation(api.game.submitEvidence, args)).toMatchObject({ ok: true, alreadySubmitted: true });
    const second = await submitPhoto(t, host, first);
    expect(second).toMatchObject({ ok: false, code: "ALREADY_SUBMITTED" });

    const guestView = await t.query(api.game.getGame, { sessionToken: guest });
    expect(guestView.leaderboard.find((x) => x.name === "Hosts")?.completedCount).toBe(1);
    await expect(t.query(api.gallery.getResults, { sessionToken: guest })).rejects.toThrow();
  });

  it("rejects proof for another team's challenge and cleans up the rejected upload", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    const hostGame = await t.query(api.game.getGame, { sessionToken: host });
    const storageId = await upload(t, "image/jpeg");
    const result = await t.mutation(api.game.submitEvidence, {
      sessionToken: guest,
      assignmentId: hostGame.assignments[0].id,
      storageId,
      mediaType: "photo",
      mimeType: "image/jpeg",
    });
    expect(result).toMatchObject({ ok: false, code: "ASSIGNMENT_NOT_FOUND" });
    expect(await t.run(async (ctx) => ctx.db.system.get("_storage", storageId))).toBeNull();
  });

  it("rejects videos over 60 seconds and non-media uploads", async () => {
    const t = await setup();
    const { host } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    const game = await t.query(api.game.getGame, { sessionToken: host });
    const video = await upload(t, "video/mp4");
    expect(
      await t.mutation(api.game.submitEvidence, {
        sessionToken: host,
        assignmentId: game.assignments[0].id,
        storageId: video,
        mediaType: "video",
        mimeType: "video/mp4",
        durationSeconds: 75,
      }),
    ).toMatchObject({ ok: false, code: "VIDEO_TOO_LONG" });
    const text = await upload(t, "text/plain");
    expect(
      await t.mutation(api.game.submitEvidence, {
        sessionToken: host,
        assignmentId: game.assignments[0].id,
        storageId: text,
        mediaType: "photo",
        mimeType: "image/jpeg",
      }),
    ).toMatchObject({ ok: false, code: "INVALID_MEDIA" });
  });

  it("keeps playing when one team finishes and reveals results when all finish", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    await completeAll(t, host);
    const hostGame = await t.query(api.game.getGame, { sessionToken: host });
    expect(hostGame.finished).toBe(true);
    expect(hostGame.status).toBe("active");

    vi.advanceTimersByTime(1000);
    await completeAll(t, guest);
    const results = await t.query(api.gallery.getResults, { sessionToken: guest });
    expect(results.endReason).toBe("all_finished");
    expect(results.standings[0].name).toBe("Hosts");
    expect(results.standings[0].isWinner).toBe(true);
    expect(results.standings[1].isLastPlace).toBe(true);
    expect(results.gallery).toHaveLength(6);
  });

  it("finalizes at the deadline and rejects late proof", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    const hostGame = await t.query(api.game.getGame, { sessionToken: host });
    await submitPhoto(t, host, hostGame.assignments[0].id);

    const { roomId, endsAt, scheduled } = await t.run(async (ctx) => {
      const room = (await ctx.db.query("rooms").first())!;
      const jobs = await ctx.db.system.query("_scheduled_functions").collect();
      return { roomId: room._id, endsAt: room.endsAt!, scheduled: jobs.map((j) => [j.name, j.scheduledTime]) };
    });
    expect(scheduled).toContainEqual(["lifecycle:finalizeAtDeadline", endsAt]);

    vi.setSystemTime(endsAt);
    await t.mutation(internal.lifecycle.finalizeAtDeadline, { roomId });

    const results = await t.query(api.gallery.getResults, { sessionToken: guest });
    expect(results.endReason).toBe("deadline");
    expect(results.standings[0].name).toBe("Hosts");
    const late = await submitPhoto(t, guest, (await t.query(api.game.getGame, { sessionToken: guest })).assignments[0].id);
    expect(late).toMatchObject({ ok: false, code: "GAME_NOT_ACTIVE" });
  });

  it("expires the room, deletes media, and is idempotent", async () => {
    const t = await setup();
    const { host, guest, roomCode } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    await completeAll(t, host);
    await completeAll(t, guest);

    vi.advanceTimersByTime(GAME_DURATION_MS + RETENTION_AFTER_DEADLINE_MS);
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect(await t.query(api.rooms.getSession, { sessionToken: host, roomCode })).toEqual({ state: "expired" });
    await expect(t.query(api.gallery.getResults, { sessionToken: host })).rejects.toThrow();
    const counts = await t.run(async (ctx) => ({
      storage: (await ctx.db.system.query("_storage").collect()).length,
      submissions: (await ctx.db.query("submissions").collect()).length,
      teams: (await ctx.db.query("teams").collect()).length,
    }));
    expect(counts).toEqual({ storage: 0, submissions: 0, teams: 0 });

    const roomId = await t.run(async (ctx) => (await ctx.db.query("rooms").first())!._id);
    await t.mutation(internal.lifecycle.expireRoom, { roomId });
  });

  it("refuses test rooms unless the deployment allows them", async () => {
    const t = await setup();
    await expect(
      t.mutation(api.rooms.createRoom, { name: "T", sessionToken: newToken(), testDurationMinutes: 2 }),
    ).rejects.toThrow(/Test rooms are disabled/);
  });
});

describe("bloopers", () => {
  it("saves bloopers without counting them and reveals them only in results", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    const game = await t.query(api.game.getGame, { sessionToken: host });
    const storageId = await upload(t, "image/jpeg");
    const saved = await t.mutation(api.game.saveBlooper, {
      sessionToken: host,
      assignmentId: game.assignments[0].id,
      storageId,
      mediaType: "photo",
      mimeType: "image/jpeg",
    });
    expect(saved).toEqual({ ok: true });
    const after = await t.query(api.game.getGame, { sessionToken: guest });
    expect(after.leaderboard.every((row) => row.completedCount === 0)).toBe(true);

    await completeAll(t, host);
    await completeAll(t, guest);
    const results = await t.query(api.gallery.getResults, { sessionToken: guest });
    expect(results.gallery).toHaveLength(6);
    expect(results.bloopers).toHaveLength(1);
    expect(results.bloopers[0].teamName).toBe("Hosts");
  });

  it("deletes bloopers when the room expires", async () => {
    const t = await setup();
    const { host, guest } = await twoTeamRoom(t);
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    const game = await t.query(api.game.getGame, { sessionToken: host });
    await t.mutation(api.game.saveBlooper, {
      sessionToken: host,
      assignmentId: game.assignments[0].id,
      storageId: await upload(t, "image/jpeg"),
      mediaType: "photo",
      mimeType: "image/jpeg",
    });
    await completeAll(t, host);
    await completeAll(t, guest);
    vi.advanceTimersByTime(GAME_DURATION_MS + RETENTION_AFTER_DEADLINE_MS);
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    const left = await t.run(async (ctx) => ({
      bloopers: (await ctx.db.query("bloopers").collect()).length,
      storage: (await ctx.db.system.query("_storage").collect()).length,
    }));
    expect(left).toEqual({ bloopers: 0, storage: 0 });
  });
});

describe("reconnect", () => {
  it("returns the same team for a stored token in every phase", async () => {
    const t = await setup();
    const { host, guest, roomCode } = await twoTeamRoom(t);
    expect(await t.query(api.rooms.getSession, { sessionToken: guest })).toMatchObject({ state: "lobby", roomCode, isHost: false });
    await t.mutation(api.rooms.startGame, { sessionToken: host });
    expect(await t.query(api.rooms.getSession, { sessionToken: guest })).toMatchObject({ state: "active", teamName: "Guests" });
    expect(await t.query(api.rooms.getSession, { sessionToken: newToken() })).toEqual({ state: "none" });
  });
});
