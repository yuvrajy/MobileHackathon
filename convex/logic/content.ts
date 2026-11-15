import { DIFFICULTIES, type Difficulty } from "../constants";

export type ChallengeInput = {
  key: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  environments: string[];
  enabled: boolean;
};

export type PunishmentInput = {
  key: string;
  description: string;
  category: string;
  enabled: boolean;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export function validateChallenges(raw: unknown, minTeams: number): { challenges: ChallengeInput[]; errors: string[] } {
  const errors: string[] = [];
  const challenges: ChallengeInput[] = [];
  if (!Array.isArray(raw)) return { challenges, errors: ["Challenges file must be a JSON array."] };
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    const where = `challenges[${index}]`;
    if (typeof item !== "object" || item === null) {
      errors.push(`${where} must be an object.`);
      return;
    }
    const c = item as Record<string, unknown>;
    if (!isNonEmptyString(c.key)) errors.push(`${where}.key is required.`);
    else if (seen.has(c.key)) errors.push(`${where}.key "${c.key}" is duplicated.`);
    if (!isNonEmptyString(c.description)) errors.push(`${where}.description is required.`);
    if (!DIFFICULTIES.includes(c.difficulty as Difficulty)) errors.push(`${where}.difficulty must be easy, medium or hard.`);
    if (c.category !== undefined && typeof c.category !== "string") errors.push(`${where}.category must be a string.`);
    if (c.environments !== undefined && (!Array.isArray(c.environments) || !c.environments.every((e) => typeof e === "string"))) {
      errors.push(`${where}.environments must be an array of strings.`);
    }
    if (c.enabled !== undefined && typeof c.enabled !== "boolean") errors.push(`${where}.enabled must be a boolean.`);
    if (isNonEmptyString(c.key)) seen.add(c.key);
    challenges.push({
      key: String(c.key ?? "").trim(),
      description: String(c.description ?? "").trim(),
      difficulty: c.difficulty as Difficulty,
      category: typeof c.category === "string" ? c.category : "general",
      environments: Array.isArray(c.environments) ? (c.environments as string[]) : [],
      enabled: c.enabled !== false,
    });
  });
  if (errors.length === 0) {
    for (const d of DIFFICULTIES) {
      const count = challenges.filter((c) => c.enabled && c.difficulty === d).length;
      if (count < minTeams) errors.push(`Only ${count} enabled ${d} challenges; at least ${minTeams} are needed to start a game.`);
    }
  }
  return { challenges: errors.length ? [] : challenges, errors };
}

export function validatePunishments(raw: unknown): { punishments: PunishmentInput[]; errors: string[] } {
  const errors: string[] = [];
  const punishments: PunishmentInput[] = [];
  if (!Array.isArray(raw)) return { punishments, errors: ["Punishments file must be a JSON array."] };
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    const where = `punishments[${index}]`;
    if (typeof item !== "object" || item === null) {
      errors.push(`${where} must be an object.`);
      return;
    }
    const p = item as Record<string, unknown>;
    if (!isNonEmptyString(p.key)) errors.push(`${where}.key is required.`);
    else if (seen.has(p.key)) errors.push(`${where}.key "${p.key}" is duplicated.`);
    if (!isNonEmptyString(p.description)) errors.push(`${where}.description is required.`);
    if (p.enabled !== undefined && typeof p.enabled !== "boolean") errors.push(`${where}.enabled must be a boolean.`);
    if (isNonEmptyString(p.key)) seen.add(p.key);
    punishments.push({
      key: String(p.key ?? "").trim(),
      description: String(p.description ?? "").trim(),
      category: typeof p.category === "string" ? p.category : "general",
      enabled: p.enabled !== false,
    });
  });
  return { punishments: errors.length ? [] : punishments, errors };
}
