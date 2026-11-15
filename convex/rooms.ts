import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { findMembership, hashSessionToken, isRoomExpired, requireMember } from "./auth";
import {
  CUSTOM_PUNISHMENT_MAX_LENGTH,
  GAME_DURATION_MS,
  MAX_AVATAR_BYTES,
  MAX_TEAMS_PER_ROOM,
  MAX_TEST_DURATION_MINUTES,
  MIN_TEAMS_TO_START,
  MIN_TEST_DURATION_MINUTES,
  PHOTO_MIME_TYPES,
  RETENTION_AFTER_DEADLINE_MS,
  TEAM_NAME_MAX_LENGTH,
  TEST_RETENTION_MS,
} from "./constants";
import { fail } from "./errors";
import { finalizeRoom } from "./lifecycle";
import { isStorageAttached, rejectUpload } from "./media";
import { assignChallenges, InsufficientChallengesError } from "./logic/assignment";
import { generateRoomCode, isWellFormedRoomCode, normalizeRoomCode } from "./logic/roomCode";

function cleanTeamName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) fail("NAME_REQUIRED", "Enter a team name.");
  return trimmed.slice(0, TEAM_NAME_MAX_LENGTH);
}

async function teamsInRoom(ctx: QueryCtx, roomId: Id<"rooms">) {
  return await ctx.db.query("teams").withIndex("by_room", (q) => q.eq("roomId", roomId)).collect();
}

async function findRoomByCode(ctx: QueryCtx, rawCode: string) {
  const code = normalizeRoomCode(rawCode);
  if (!isWellFormedRoomCode(code)) return null;
  return await ctx.db.query("rooms").withIndex("by_code", (q) => q.eq("code", code)).unique();
}

async function avatarUrl(ctx: QueryCtx, team: Doc<"teams">) {
  return team.avatarStorageId ? await ctx.storage.getUrl(team.avatarStorageId) : null;
}

async function uniqueRoomCode(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = generateRoomCode();
    const existing = await ctx.db.query("rooms").withIndex("by_code", (q) => q.eq("code", code)).unique();
    if (!existing) return code;
  }
  throw new Error("Could not allocate a room code.");
}

export const createRoom = mutation({
  args: { name: v.string(), sessionToken: v.string(), testDurationMinutes: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const name = cleanTeamName(args.name);
    const sessionHash = await hashSessionToken(args.sessionToken);
    const existing = await findMembership(ctx, args.sessionToken);
    if (existing) {
      if (existing.room.hostTeamId === existing.team._id) return { roomCode: existing.room.code, teamId: existing.team._id };
      fail("SESSION_IN_OTHER_ROOM", "This device session already belongs to another room.");
    }

    let durationMs = GAME_DURATION_MS;
    let retentionMs = RETENTION_AFTER_DEADLINE_MS;
    const isTestRoom = args.testDurationMinutes !== undefined;
    if (isTestRoom) {
      if (process.env.ALLOW_TEST_ROOMS !== "true") fail("TEST_ROOMS_DISABLED", "Test rooms are disabled on this deployment.");
      const minutes = Math.round(args.testDurationMinutes!);
      if (minutes < MIN_TEST_DURATION_MINUTES || minutes > MAX_TEST_DURATION_MINUTES) {
        fail("TEST_ROOMS_DISABLED", `Test games must be ${MIN_TEST_DURATION_MINUTES}-${MAX_TEST_DURATION_MINUTES} minutes.`);
      }
      durationMs = minutes * 60 * 1000;
      retentionMs = TEST_RETENTION_MS;
    }

    const defaultPunishment = await ctx.db.query("punishments").withIndex("by_enabled", (q) => q.eq("enabled", true)).first();
    const roomId = await ctx.db.insert("rooms", {
      code: await uniqueRoomCode(ctx),
      status: "lobby",
      punishment: defaultPunishment
        ? { kind: "preset", presetKey: defaultPunishment.key, text: defaultPunishment.description }
        : { kind: "skip" },
      durationMs,
      retentionMs,
      isTestRoom,
    });
    const teamId = await ctx.db.insert("teams", { roomId, name, sessionHash, completedCount: 0 });
    await ctx.db.patch("rooms", roomId, { hostTeamId: teamId });
    const room = (await ctx.db.get("rooms", roomId))!;
    return { roomCode: room.code, teamId };
  },
});

export const lookupLobby = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const room = await findRoomByCode(ctx, code);
    if (!room) return { status: "not_found" as const };
    if (isRoomExpired(room, Date.now())) return { status: "expired" as const };
    if (room.status !== "lobby") return { status: "started" as const };
    const teams = await teamsInRoom(ctx, room._id);
    if (teams.length >= MAX_TEAMS_PER_ROOM) return { status: "full" as const };
    return { status: "joinable" as const };
  },
});

export const joinRoom = mutation({
  args: { code: v.string(), name: v.string(), sessionToken: v.string() },
  handler: async (ctx, args) => {
    const name = cleanTeamName(args.name);
    const sessionHash = await hashSessionToken(args.sessionToken);
    const room = await findRoomByCode(ctx, args.code);
    if (!room) fail("ROOM_NOT_FOUND", "No room has that code.");

    const existing = await findMembership(ctx, args.sessionToken);
    if (existing) {
      if (existing.room._id === room._id) return { roomCode: room.code, teamId: existing.team._id };
      fail("SESSION_IN_OTHER_ROOM", "This device session already belongs to another room.");
    }

    if (isRoomExpired(room, Date.now())) fail("ROOM_EXPIRED", "This room has expired.");
    if (room.status !== "lobby") fail("ROOM_STARTED", "This game has already started. New teams can't join.");
    const teams = await teamsInRoom(ctx, room._id);
    if (teams.length >= MAX_TEAMS_PER_ROOM) fail("ROOM_FULL", "This room is full.");
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) fail("NAME_TAKEN", "Another team already uses that name.");

    const teamId = await ctx.db.insert("teams", { roomId: room._id, name, sessionHash, completedCount: 0 });
    return { roomCode: room.code, teamId };
  },
});

export const getSession = query({
  args: { sessionToken: v.string(), roomCode: v.optional(v.string()) },
  handler: async (ctx, { sessionToken, roomCode }) => {
    const membership = await findMembership(ctx, sessionToken);
    if (!membership) {
      const room = roomCode ? await findRoomByCode(ctx, roomCode) : null;
      return room && room.status === "expired" ? { state: "expired" as const } : { state: "none" as const };
    }
    const { room, team } = membership;
    if (isRoomExpired(room, Date.now())) return { state: "expired" as const };
    return {
      state: room.status,
      roomCode: room.code,
      teamId: team._id,
      teamName: team.name,
      isHost: room.hostTeamId === team._id,
    };
  },
});

export const getLobby = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const { room, team } = await requireMember(ctx, sessionToken, ["lobby", "active", "results"]);
    const teams = await teamsInRoom(ctx, room._id);
    return {
      roomCode: room.code,
      status: room.status,
      isHost: room.hostTeamId === team._id,
      myTeamId: team._id,
      punishment: room.punishment,
      isTestRoom: room.isTestRoom,
      durationMs: room.durationMs,
      minTeams: MIN_TEAMS_TO_START,
      teams: await Promise.all(
        teams.map(async (t) => ({ id: t._id, name: t.name, avatarUrl: await avatarUrl(ctx, t), isHost: room.hostTeamId === t._id })),
      ),
    };
  },
});

export const generateAvatarUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireMember(ctx, sessionToken, ["lobby"]);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setAvatar = mutation({
  args: { sessionToken: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, { sessionToken, storageId }) => {
    const membership = await findMembership(ctx, sessionToken);
    if (!membership || isRoomExpired(membership.room, Date.now())) {
      return await rejectUpload(ctx, storageId, "INVALID_SESSION", "You are not part of this room.");
    }
    if (membership.room.status !== "lobby") return await rejectUpload(ctx, storageId, "GAME_NOT_ACTIVE", "Team photos can only change in the lobby.");
    const meta = await ctx.db.system.get("_storage", storageId);
    if (!meta) return { ok: false as const, code: "INVALID_MEDIA" as const, message: "Upload not found." };
    if (await isStorageAttached(ctx, storageId)) return { ok: false as const, code: "INVALID_MEDIA" as const, message: "Upload already used." };
    if (!meta.contentType || !PHOTO_MIME_TYPES.includes(meta.contentType)) {
      return await rejectUpload(ctx, storageId, "INVALID_MEDIA", "Team photos must be images.");
    }
    if (meta.size > MAX_AVATAR_BYTES) return await rejectUpload(ctx, storageId, "MEDIA_TOO_LARGE", "That photo is too large.");

    const previous = membership.team.avatarStorageId;
    await ctx.db.patch("teams", membership.team._id, { avatarStorageId: storageId });
    if (previous && (await ctx.db.system.get("_storage", previous))) await ctx.storage.delete(previous);
    return { ok: true as const };
  },
});

export const setPunishment = mutation({
  args: {
    sessionToken: v.string(),
    kind: v.union(v.literal("skip"), v.literal("preset"), v.literal("custom")),
    presetKey: v.optional(v.string()),
    customText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { room, team } = await requireMember(ctx, args.sessionToken, ["lobby"]);
    if (room.hostTeamId !== team._id) fail("NOT_HOST", "Only the host can choose the punishment.");

    if (args.kind === "skip") {
      await ctx.db.patch("rooms", room._id, { punishment: { kind: "skip" } });
      return;
    }
    if (args.kind === "preset") {
      const preset = args.presetKey
        ? await ctx.db.query("punishments").withIndex("by_key", (q) => q.eq("key", args.presetKey!)).unique()
        : null;
      if (!preset || !preset.enabled) fail("INVALID_PUNISHMENT", "Pick one of the listed punishments.");
      await ctx.db.patch("rooms", room._id, { punishment: { kind: "preset", presetKey: preset.key, text: preset.description } });
      return;
    }
    const text = (args.customText ?? "").trim().replace(/\s+/g, " ");
    if (!text) fail("INVALID_PUNISHMENT", "Type a punishment or choose Skip.");
    if (text.length > CUSTOM_PUNISHMENT_MAX_LENGTH) fail("INVALID_PUNISHMENT", "Keep the punishment short.");
    await ctx.db.patch("rooms", room._id, { punishment: { kind: "custom", text } });
  },
});

export const startGame = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const { room, team } = await requireMember(ctx, sessionToken, ["lobby"]);
    if (room.hostTeamId !== team._id) fail("NOT_HOST", "Only the host can start the game.");
    const teams = await teamsInRoom(ctx, room._id);
    if (teams.length < MIN_TEAMS_TO_START) fail("NOT_ENOUGH_TEAMS", `At least ${MIN_TEAMS_TO_START} teams are needed to start.`);

    const pool = (
      await Promise.all(
        (["easy", "medium", "hard"] as const).map((difficulty) =>
          ctx.db
            .query("challenges")
            .withIndex("by_difficulty_enabled", (q) => q.eq("difficulty", difficulty).eq("enabled", true))
            .collect(),
        ),
      )
    ).flat();

    let plan;
    try {
      plan = assignChallenges(
        [...teams].sort((a, b) => Number(b._id === room.hostTeamId) - Number(a._id === room.hostTeamId) || a._creationTime - b._creationTime).map((t) => t._id),
        [...pool]
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((c) => ({ key: c.key, description: c.description, difficulty: c.difficulty })),
        null,
      );
    } catch (error) {
      if (error instanceof InsufficientChallengesError) {
        fail("NOT_ENOUGH_CHALLENGES", `There aren't enough ${error.difficulty} challenges for ${teams.length} teams.`);
      }
      throw error;
    }

    for (const { teamId, challenges } of plan) {
      for (const c of challenges) {
        await ctx.db.insert("assignments", {
          roomId: room._id,
          teamId,
          challengeKey: c.key,
          description: c.description,
          difficulty: c.difficulty,
          status: "pending",
        });
      }
    }

    const startedAt = Date.now();
    const endsAt = startedAt + room.durationMs;
    const expiresAt = endsAt + room.retentionMs;
    await ctx.db.patch("rooms", room._id, { status: "active", startedAt, endsAt, expiresAt });
    await ctx.scheduler.runAt(endsAt, internal.lifecycle.finalizeAtDeadline, { roomId: room._id });
    await ctx.scheduler.runAt(expiresAt, internal.lifecycle.expireRoom, { roomId: room._id });
    return { endsAt };
  },
});

export const endRoom = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const { room, team } = await requireMember(ctx, sessionToken, ["lobby", "active"]);
    if (room.hostTeamId !== team._id) fail("NOT_HOST", "Only the host can end the game.");
    if (room.status === "active") {
      await finalizeRoom(ctx, room, "host_ended");
      return;
    }
    await ctx.db.patch("rooms", room._id, { status: "expired", endedAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.lifecycle.expireRoom, { roomId: room._id });
  },
});
