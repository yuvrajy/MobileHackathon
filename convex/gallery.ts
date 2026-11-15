import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { requireMember } from "./auth";

export const getResults = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const { room, team } = await requireMember(ctx, sessionToken, ["results"]);
    const result = room.result!;
    const teams = await ctx.db.query("teams").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();
    const teamById = new Map(teams.map((t) => [t._id, t]));
    const assignments = await ctx.db.query("assignments").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();
    const assignmentById = new Map(assignments.map((a) => [a._id, a]));
    const submissions = await ctx.db.query("submissions").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();
    const bloopers = await ctx.db.query("bloopers").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();

    const mediaItems = async (items: (Doc<"submissions"> | Doc<"bloopers">)[]) => {
      const rows = await Promise.all(
        items.map(async (s) => {
          const a = assignmentById.get(s.assignmentId);
          return {
            id: s._id,
            teamName: teamById.get(s.teamId)?.name ?? "Team",
            challenge: a?.description ?? "",
            difficulty: a?.difficulty ?? "easy",
            mediaType: s.mediaType,
            mimeType: s.mimeType,
            url: await ctx.storage.getUrl(s.storageId),
          };
        }),
      );
      return rows.filter((row) => row.url !== null);
    };

    const standings = await Promise.all(
      result.standings.map(async (s) => {
        const t = teamById.get(s.teamId);
        return {
          teamId: s.teamId,
          rank: s.rank,
          completedCount: s.completedCount,
          name: t?.name ?? "Team",
          avatarUrl: t?.avatarStorageId ? await ctx.storage.getUrl(t.avatarStorageId) : null,
          isWinner: result.winnerTeamIds.includes(s.teamId),
          isLastPlace: result.lastPlaceTeamId === s.teamId,
        };
      }),
    );

    return {
      roomCode: room.code,
      myTeamId: team._id,
      endReason: result.endReason,
      expiresAt: room.expiresAt!,
      punishment: room.punishment,
      lastPlaceTeamId: result.lastPlaceTeamId,
      standings,
      gallery: await mediaItems(submissions.sort((a, b) => a.submittedAt - b.submittedAt)),
      bloopers: await mediaItems(bloopers.sort((a, b) => a.savedAt - b.savedAt)),
    };
  },
});
