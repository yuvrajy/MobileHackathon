// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseLines, readContent } from "../scripts/content-files.mjs";
import { validateChallenges, validatePunishments } from "../convex/logic/content";

describe("content text files", () => {
  it("ignores comments and blank lines and collapses whitespace", () => {
    expect(parseLines("# heading\n\n  Take a   photo  \r\n# note\nSing a song\n")).toEqual([
      { text: "Take a photo", line: 3 },
      { text: "Sing a song", line: 5 },
    ]);
  });

  it("parses the repository content into a valid import", () => {
    const { challenges, punishments, errors } = readContent("content");
    expect(errors).toEqual([]);
    expect(validateChallenges(challenges, 2).errors).toEqual([]);
    expect(validatePunishments(punishments).errors).toEqual([]);
    expect(new Set(challenges.map((c) => c.key)).size).toBe(challenges.length);
  });
});
