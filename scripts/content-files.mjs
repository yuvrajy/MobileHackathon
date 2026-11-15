import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const DIFFICULTIES = ["easy", "medium", "hard"];

export function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map((raw, index) => ({ text: raw.trim().replace(/\s+/g, " "), line: index + 1 }))
    .filter(({ text }) => text.length > 0 && !text.startsWith("#"));
}

function keyFor(prefix, text) {
  return `${prefix}_${createHash("sha1").update(text.toLowerCase()).digest("hex").slice(0, 12)}`;
}

function collect(entries, file, prefix, errors) {
  const seen = new Map();
  const items = [];
  for (const { text, line } of entries) {
    const key = keyFor(prefix, text);
    if (seen.has(key)) {
      errors.push(`${file}:${line} repeats line ${seen.get(key)}: "${text}"`);
      continue;
    }
    seen.set(key, line);
    items.push({ key, description: text, position: items.length });
  }
  return items;
}

export function readContent(dir) {
  const errors = [];
  const challenges = DIFFICULTIES.flatMap((difficulty) => {
    const file = join(dir, "challenges", `${difficulty}.txt`);
    return collect(parseLines(readFileSync(file, "utf8")), file, difficulty, errors).map((c) => ({
      ...c,
      difficulty,
      category: "general",
      environments: [],
      enabled: true,
    }));
  });
  const punishmentsFile = join(dir, "punishments.txt");
  const punishments = collect(parseLines(readFileSync(punishmentsFile, "utf8")), punishmentsFile, "punishment", errors).map((p) => ({
    ...p,
    category: "general",
    enabled: true,
  }));
  return { challenges, punishments, errors };
}
