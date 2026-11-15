import { describe, expect, it } from "vitest";
import { assignChallenges, InsufficientChallengesError, type PoolChallenge } from "../convex/logic/assignment";
import { rankTeams } from "../convex/logic/ranking";
import { validateChallenges, validatePunishments } from "../convex/logic/content";
import { generateRoomCode, isWellFormedRoomCode, normalizeRoomCode } from "../convex/logic/roomCode";

function pool(perTier: number): PoolChallenge[] {
  return (["easy", "medium", "hard"] as const).flatMap((difficulty) =>
    Array.from({ length: perTier }, (_, i) => ({ key: `${difficulty}_${i}`, description: `${difficulty} ${i}`, difficulty })),
  );
}

describe("assignChallenges", () => {
  it("gives every team one challenge per tier with no duplicates in the room", () => {
    for (let run = 0; run < 50; run++) {
      const teams = ["a", "b", "c", "d"];
      const plan = assignChallenges(teams, pool(5));
      const keys = plan.flatMap((p) => p.challenges.map((c) => c.key));
      expect(new Set(keys).size).toBe(keys.length);
      for (const p of plan) expect(p.challenges.map((c) => c.difficulty)).toEqual(["easy", "medium", "hard"]);
    }
  });

  it("refuses to start when a tier is too small instead of substituting", () => {
    const challenges = pool(3).filter((c) => !(c.difficulty === "hard" && c.key !== "hard_0"));
    expect(() => assignChallenges(["a", "b"], challenges)).toThrow(InsufficientChallengesError);
  });

  it("works with exactly enough challenges", () => {
    const plan = assignChallenges(["a", "b"], pool(2));
    expect(plan).toHaveLength(2);
  });
});

describe("rankTeams", () => {
  it("ranks full completions by earliest finish", () => {
    const r = rankTeams([
      { id: "late", completedCount: 3, finishedAt: 200, lastCompletedAt: 200 },
      { id: "early", completedCount: 3, finishedAt: 100, lastCompletedAt: 100 },
      { id: "partial", completedCount: 2, lastCompletedAt: 50 },
    ]);
    expect(r.standings.map((s) => s.teamId)).toEqual(["early", "late", "partial"]);
    expect(r.winnerTeamIds).toEqual(["early"]);
    expect(r.lastPlaceTeamId).toBe("partial");
  });

  it("uses most completed when nobody finishes, then earliest last completion", () => {
    const r = rankTeams([
      { id: "one", completedCount: 1, lastCompletedAt: 10 },
      { id: "two_late", completedCount: 2, lastCompletedAt: 300 },
      { id: "two_early", completedCount: 2, lastCompletedAt: 100 },
    ]);
    expect(r.standings.map((s) => [s.teamId, s.rank])).toEqual([["two_early", 1], ["two_late", 2], ["one", 3]]);
    expect(r.lastPlaceTeamId).toBe("one");
  });

  it("does not invent a winner or loser when everyone has zero", () => {
    const r = rankTeams([
      { id: "a", completedCount: 0 },
      { id: "b", completedCount: 0 },
    ]);
    expect(r.winnerTeamIds).toEqual([]);
    expect(r.lastPlaceTeamId).toBeNull();
    expect(r.standings.every((s) => s.rank === 1)).toBe(true);
  });

  it("reports a tie for last instead of picking one", () => {
    const r = rankTeams([
      { id: "w", completedCount: 2, lastCompletedAt: 5 },
      { id: "x", completedCount: 0 },
      { id: "y", completedCount: 0 },
    ]);
    expect(r.winnerTeamIds).toEqual(["w"]);
    expect(r.lastPlaceTeamId).toBeNull();
  });
});

describe("content validation", () => {
  it("rejects duplicate keys, bad tiers and missing text", () => {
    const { errors } = validateChallenges(
      [
        { key: "a", description: "x", difficulty: "easy" },
        { key: "a", description: "", difficulty: "impossible" },
      ],
      1,
    );
    expect(errors.join(" ")).toMatch(/duplicated/);
    expect(errors.join(" ")).toMatch(/description is required/);
    expect(errors.join(" ")).toMatch(/difficulty must be/);
  });

  it("rejects pools too small for the minimum team count", () => {
    const { errors } = validateChallenges(
      [
        { key: "e", description: "x", difficulty: "easy" },
        { key: "m", description: "x", difficulty: "medium" },
        { key: "h", description: "x", difficulty: "hard" },
      ],
      2,
    );
    expect(errors).toHaveLength(3);
  });
});

describe("room codes", () => {
  it("normalizes and validates", () => {
    expect(normalizeRoomCode("  ab c12 3 ")).toBe("ABC123");
    expect(isWellFormedRoomCode("ABC123")).toBe(true);
    expect(isWellFormedRoomCode("ABC12")).toBe(false);
    expect(isWellFormedRoomCode(generateRoomCode())).toBe(true);
  });
});
