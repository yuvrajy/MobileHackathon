import { v } from "convex/values";
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

    const gallery = await Promise.all(
      submissions
        .sort((a, b) => a.submittedAt - b.submittedAt)
        .map(async (s) => {
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

    return {
      roomCode: room.code,
      myTeamId: team._id,
      endReason: result.endReason,
      expiresAt: room.expiresAt!,
      punishment: room.punishment,
      lastPlaceTeamId: result.lastPlaceTeamId,
      standings,
      gallery: gallery.filter((g) => g.url !== null),
    };
  },
});
