import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { findMembership, isRoomExpired, requireMember } from "./auth";
import { CHALLENGES_PER_TEAM, MAX_PHOTO_BYTES, MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, PHOTO_MIME_TYPES, VIDEO_MIME_TYPES } from "./constants";
import { fail, type ErrorCode } from "./errors";
import { finalizeRoom } from "./lifecycle";
import { isStorageAttached, rejectUpload } from "./media";
import { mediaType } from "./schema";

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 } as const;

export const serverNow = mutation({
  args: {},
  handler: async () => Date.now(),
});

export const getGame = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const { room, team } = await requireMember(ctx, sessionToken, ["active", "results"]);
    const assignments = await ctx.db.query("assignments").withIndex("by_team", (q) => q.eq("teamId", team._id)).collect();
    const teams = await ctx.db.query("teams").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();
    const leaderboard = await Promise.all(
      [...teams]
        .sort((a, b) => b.completedCount - a.completedCount || a.name.localeCompare(b.name))
        .map(async (t) => ({
          id: t._id,
          name: t.name,
          avatarUrl: t.avatarStorageId ? await ctx.storage.getUrl(t.avatarStorageId) : null,
          completedCount: t.completedCount,
        })),
    );
    return {
      status: room.status,
      roomCode: room.code,
      endsAt: room.endsAt!,
      myTeamId: team._id,
      myTeamName: team.name,
      finished: team.completedCount >= CHALLENGES_PER_TEAM,
      punishment: room.punishment,
      assignments: assignments
        .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty])
        .map((a) => ({ id: a._id, description: a.description, difficulty: a.difficulty, status: a.status })),
      leaderboard,
    };
  },
});

export const generateProofUploadUrl = mutation({
  args: { sessionToken: v.string(), assignmentId: v.id("assignments") },
  handler: async (ctx, { sessionToken, assignmentId }) => {
    const { room, team } = await requireMember(ctx, sessionToken, ["active"]);
    if (Date.now() >= room.endsAt!) fail("DEADLINE_PASSED", "Time is up.");
    const assignment = await ctx.db.get("assignments", assignmentId);
    if (!assignment || assignment.teamId !== team._id) fail("ASSIGNMENT_NOT_FOUND", "That challenge isn't yours.");
    if (assignment.status !== "pending") fail("ALREADY_SUBMITTED", "This challenge is already complete.");
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitEvidence = mutation({
  args: {
    sessionToken: v.string(),
    assignmentId: v.id("assignments"),
    storageId: v.id("_storage"),
    mediaType,
    mimeType: v.string(),
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reject = (code: ErrorCode, message: string) => rejectUpload(ctx, args.storageId, code, message);
    const membership = await findMembership(ctx, args.sessionToken);
    if (!membership) return await reject("INVALID_SESSION", "You are not part of this room.");
    const { room, team } = membership;

    const existing = await ctx.db.query("submissions").withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId)).first();
    if (existing && existing.teamId === team._id && existing.storageId === args.storageId) {
      return { ok: true as const, alreadySubmitted: true, completedCount: team.completedCount };
    }

    const now = Date.now();
    if (isRoomExpired(room, now)) return await reject("ROOM_EXPIRED", "This room has expired.");
    if (room.status !== "active") return await reject("GAME_NOT_ACTIVE", "The game isn't running.");
    if (now >= room.endsAt!) return await reject("DEADLINE_PASSED", "Time is up. This proof wasn't counted.");

    const assignment = await ctx.db.get("assignments", args.assignmentId);
    if (!assignment || assignment.teamId !== team._id) return await reject("ASSIGNMENT_NOT_FOUND", "That challenge isn't yours.");
    if (existing || assignment.status !== "pending") return await reject("ALREADY_SUBMITTED", "This challenge is already complete.");

    const meta = await ctx.db.system.get("_storage", args.storageId);
    if (!meta) return { ok: false as const, code: "INVALID_MEDIA" as const, message: "The upload didn't arrive. Try again." };
    if (await isStorageAttached(ctx, args.storageId)) {
      return { ok: false as const, code: "INVALID_MEDIA" as const, message: "That upload was already used." };
    }

    const allowed = args.mediaType === "photo" ? PHOTO_MIME_TYPES : VIDEO_MIME_TYPES;
    const contentType = meta.contentType ?? args.mimeType;
    if (!allowed.includes(contentType)) return await reject("INVALID_MEDIA", "That file type isn't supported.");
    const maxBytes = args.mediaType === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
    if (meta.size > maxBytes) return await reject("MEDIA_TOO_LARGE", "That file is too large. Retake a shorter clip.");
    if (args.mediaType === "video" && (args.durationSeconds === undefined || args.durationSeconds > MAX_VIDEO_SECONDS + 1)) {
      return await reject("VIDEO_TOO_LONG", `Videos can be at most ${MAX_VIDEO_SECONDS} seconds.`);
    }

    await ctx.db.insert("submissions", {
      roomId: room._id,
      teamId: team._id,
      assignmentId: assignment._id,
      storageId: args.storageId,
      mediaType: args.mediaType,
      mimeType: contentType,
      durationSeconds: args.durationSeconds,
      submittedAt: now,
    });
    await ctx.db.patch("assignments", assignment._id, { status: "completed", completedAt: now });
    const completedCount = team.completedCount + 1;
    await ctx.db.patch("teams", team._id, {
      completedCount,
      lastCompletedAt: now,
      ...(completedCount >= CHALLENGES_PER_TEAM ? { finishedAt: now } : {}),
    });

    const teams = await ctx.db.query("teams").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();
    if (teams.every((t) => t.completedCount >= CHALLENGES_PER_TEAM)) {
      await finalizeRoom(ctx, (await ctx.db.get("rooms", room._id))!, "all_finished");
    }
    return { ok: true as const, alreadySubmitted: false, completedCount };
  },
});
