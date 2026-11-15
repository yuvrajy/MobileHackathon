import { CHALLENGES_PER_TEAM } from "../constants";

export type RankableTeam<Id> = {
  id: Id;
  completedCount: number;
  finishedAt?: number;
  lastCompletedAt?: number;
};

export type RankedTeam<Id> = { teamId: Id; rank: number; completedCount: number };

export type RankingResult<Id> = {
  standings: RankedTeam<Id>[];
  winnerTeamIds: Id[];
  lastPlaceTeamId: Id | null;
};

function tieBreakTime<Id>(team: RankableTeam<Id>): number {
  if (team.completedCount === 0) return Number.POSITIVE_INFINITY;
  const time = team.completedCount >= CHALLENGES_PER_TEAM ? team.finishedAt : team.lastCompletedAt;
  return time ?? Number.POSITIVE_INFINITY;
}

function compare<Id>(a: RankableTeam<Id>, b: RankableTeam<Id>): number {
  if (a.completedCount !== b.completedCount) return b.completedCount - a.completedCount;
  const ta = tieBreakTime(a);
  const tb = tieBreakTime(b);
  if (ta === tb) return 0;
  return ta < tb ? -1 : 1;
}

export function rankTeams<Id>(teams: RankableTeam<Id>[]): RankingResult<Id> {
  const sorted = [...teams].sort(compare);
  const standings: RankedTeam<Id>[] = [];
  sorted.forEach((team, index) => {
    const previous = sorted[index - 1];
    const rank = previous && compare(previous, team) === 0 ? standings[index - 1].rank : index + 1;
    standings.push({ teamId: team.id, rank, completedCount: team.completedCount });
  });

  const anyCompletion = standings.some((s) => s.completedCount > 0);
  const winnerTeamIds = anyCompletion ? standings.filter((s) => s.rank === 1).map((s) => s.teamId) : [];

  let lastPlaceTeamId: Id | null = null;
  if (standings.length > 1) {
    const worstRank = standings[standings.length - 1].rank;
    const atWorst = standings.filter((s) => s.rank === worstRank);
    if (atWorst.length === 1 && worstRank !== 1) lastPlaceTeamId = atWorst[0].teamId;
  }

  return { standings, winnerTeamIds, lastPlaceTeamId };
}
