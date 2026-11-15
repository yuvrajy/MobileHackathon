import { DIFFICULTIES, type Difficulty } from "../constants";

export type PoolChallenge = { key: string; description: string; difficulty: Difficulty };
export type TeamAssignment<TeamId> = { teamId: TeamId; challenges: PoolChallenge[] };

export class InsufficientChallengesError extends Error {
  constructor(public difficulty: Difficulty, public available: number, public needed: number) {
    super(`Not enough ${difficulty} challenges: ${available} available, ${needed} needed.`);
  }
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function assignChallenges<TeamId>(
  teamIds: TeamId[],
  pool: PoolChallenge[],
  random: (() => number) | null = Math.random,
): TeamAssignment<TeamId>[] {
  const byDifficulty = new Map<Difficulty, PoolChallenge[]>();
  for (const difficulty of DIFFICULTIES) {
    const unique = new Map<string, PoolChallenge>();
    for (const c of pool) if (c.difficulty === difficulty) unique.set(c.key, c);
    const tier = [...unique.values()];
    if (tier.length < teamIds.length) {
      throw new InsufficientChallengesError(difficulty, tier.length, teamIds.length);
    }
    byDifficulty.set(difficulty, random ? shuffle(tier, random) : tier);
  }
  return teamIds.map((teamId, index) => ({
    teamId,
    challenges: DIFFICULTIES.map((d) => byDifficulty.get(d)![index]),
  }));
}
