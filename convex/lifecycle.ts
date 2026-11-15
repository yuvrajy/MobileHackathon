import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { rankTeams } from "./logic/ranking";

const CLEANUP_BATCH = 50;

export async function finalizeRoom(ctx: MutationCtx, room: Doc<"rooms">, endReason: "all_finished" | "deadline") {
  if (room.status !== "active") return;
  const teams = await ctx.db.query("teams").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();
  const ranking = rankTeams(
    teams.map((t) => ({ id: t._id, completedCount: t.completedCount, finishedAt: t.finishedAt, lastCompletedAt: t.lastCompletedAt })),
  );
  await ctx.db.patch("rooms", room._id, { status: "results", endedAt: Date.now(), result: { ...ranking, endReason } });
}

export const finalizeAtDeadline = internalMutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const room = await ctx.db.get("rooms", roomId);
    if (!room || room.status !== "active") return;
    await finalizeRoom(ctx, room, "deadline");
  },
});

export const expireRoom = internalMutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const room = await ctx.db.get("rooms", roomId);
    if (!room) return;
    if (room.status !== "expired") {
      await ctx.db.patch("rooms", roomId, { status: "expired", result: undefined, hostTeamId: undefined });
    }

    const submissions = await ctx.db.query("submissions").withIndex("by_room", (q) => q.eq("roomId", roomId)).take(CLEANUP_BATCH);
    for (const s of submissions) {
      if (await ctx.db.system.get("_storage", s.storageId)) await ctx.storage.delete(s.storageId);
      await ctx.db.delete("submissions", s._id);
    }
    const assignments = await ctx.db.query("assignments").withIndex("by_room", (q) => q.eq("roomId", roomId)).take(CLEANUP_BATCH);
    for (const a of assignments) await ctx.db.delete("assignments", a._id);
    const teams = await ctx.db.query("teams").withIndex("by_room", (q) => q.eq("roomId", roomId)).take(CLEANUP_BATCH);
    for (const t of teams) {
      if (t.avatarStorageId && (await ctx.db.system.get("_storage", t.avatarStorageId))) await ctx.storage.delete(t.avatarStorageId);
      await ctx.db.delete("teams", t._id);
    }

    if (submissions.length === CLEANUP_BATCH || assignments.length === CLEANUP_BATCH || teams.length === CLEANUP_BATCH) {
      await ctx.scheduler.runAfter(0, internal.lifecycle.expireRoom, { roomId });
    }
  },
});
