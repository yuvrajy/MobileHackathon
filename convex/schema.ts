import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const difficulty = v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"));
export const mediaType = v.union(v.literal("photo"), v.literal("video"));
export const punishment = v.union(
  v.object({ kind: v.literal("skip") }),
  v.object({ kind: v.literal("preset"), presetKey: v.string(), text: v.string() }),
  v.object({ kind: v.literal("custom"), text: v.string() }),
);

export default defineSchema({
  challenges: defineTable({
    key: v.string(),
    description: v.string(),
    difficulty,
    category: v.string(),
    environments: v.array(v.string()),
    enabled: v.boolean(),
  })
    .index("by_key", ["key"])
    .index("by_difficulty_enabled", ["difficulty", "enabled"]),

  punishments: defineTable({
    key: v.string(),
    description: v.string(),
    category: v.string(),
    enabled: v.boolean(),
  })
    .index("by_key", ["key"])
    .index("by_enabled", ["enabled"]),

  rooms: defineTable({
    code: v.string(),
    status: v.union(v.literal("lobby"), v.literal("active"), v.literal("results"), v.literal("expired")),
    hostTeamId: v.optional(v.id("teams")),
    punishment,
    durationMs: v.number(),
    retentionMs: v.number(),
    isTestRoom: v.boolean(),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    result: v.optional(
      v.object({
        standings: v.array(v.object({ teamId: v.id("teams"), rank: v.number(), completedCount: v.number() })),
        winnerTeamIds: v.array(v.id("teams")),
        lastPlaceTeamId: v.union(v.id("teams"), v.null()),
        endReason: v.union(v.literal("all_finished"), v.literal("deadline"), v.literal("host_ended")),
      }),
    ),
  }).index("by_code", ["code"]),

  teams: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    sessionHash: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
    completedCount: v.number(),
    lastCompletedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
  })
    .index("by_session", ["sessionHash"])
    .index("by_room", ["roomId"])
    .index("by_avatar", ["avatarStorageId"]),

  assignments: defineTable({
    roomId: v.id("rooms"),
    teamId: v.id("teams"),
    challengeKey: v.string(),
    description: v.string(),
    difficulty,
    status: v.union(v.literal("pending"), v.literal("completed")),
    completedAt: v.optional(v.number()),
  })
    .index("by_team", ["teamId"])
    .index("by_room", ["roomId"]),

  submissions: defineTable({
    roomId: v.id("rooms"),
    teamId: v.id("teams"),
    assignmentId: v.id("assignments"),
    storageId: v.id("_storage"),
    mediaType,
    mimeType: v.string(),
    durationSeconds: v.optional(v.number()),
    submittedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_assignment", ["assignmentId"])
    .index("by_storage", ["storageId"]),

  bloopers: defineTable({
    roomId: v.id("rooms"),
    teamId: v.id("teams"),
    assignmentId: v.id("assignments"),
    storageId: v.id("_storage"),
    mediaType,
    mimeType: v.string(),
    durationSeconds: v.optional(v.number()),
    savedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_team", ["teamId"])
    .index("by_storage", ["storageId"]),
});
