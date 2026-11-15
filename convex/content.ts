import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { MIN_TEAMS_TO_START } from "./constants";
import { validateChallenges, validatePunishments } from "./logic/content";

async function importContentData(ctx: MutationCtx, rawChallenges: unknown, rawPunishments: unknown) {
  const { challenges, errors: challengeErrors } = validateChallenges(rawChallenges, MIN_TEAMS_TO_START);
  const { punishments, errors: punishmentErrors } = validatePunishments(rawPunishments);
  const errors = [...challengeErrors, ...punishmentErrors];
  if (errors.length) throw new Error(`Content import rejected:\n${errors.join("\n")}`);

  const challengeKeys = new Set(challenges.map((c) => c.key));
  for (const challenge of challenges) {
    const existing = await ctx.db.query("challenges").withIndex("by_key", (q) => q.eq("key", challenge.key)).unique();
    if (existing) await ctx.db.patch("challenges", existing._id, challenge);
    else await ctx.db.insert("challenges", challenge);
  }
  for (const stale of await ctx.db.query("challenges").collect()) {
    if (!challengeKeys.has(stale.key) && stale.enabled) await ctx.db.patch("challenges", stale._id, { enabled: false });
  }

  const punishmentKeys = new Set(punishments.map((p) => p.key));
  for (const punishment of punishments) {
    const existing = await ctx.db.query("punishments").withIndex("by_key", (q) => q.eq("key", punishment.key)).unique();
    if (existing) await ctx.db.patch("punishments", existing._id, punishment);
    else await ctx.db.insert("punishments", punishment);
  }
  for (const stale of await ctx.db.query("punishments").collect()) {
    if (!punishmentKeys.has(stale.key) && stale.enabled) await ctx.db.patch("punishments", stale._id, { enabled: false });
  }

  return { challenges: challenges.length, punishments: punishments.length };
}

export const importContent = internalMutation({
  args: { challenges: v.any(), punishments: v.any() },
  handler: (ctx, args) => importContentData(ctx, args.challenges, args.punishments),
});

export const listPunishments = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("punishments").withIndex("by_enabled", (q) => q.eq("enabled", true)).collect();
    return rows.map((p) => ({ key: p.key, description: p.description, category: p.category }));
  },
});
