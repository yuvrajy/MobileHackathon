// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readContent } from "../scripts/content-files.mjs";
import {
  challengeArt,
  getChallengeArtKey,
  getChallengeScene,
} from "../lib/challengeArt";

describe("challenge illustration coverage", () => {
  it("maps every current content key and description to a distinct intentional scene", () => {
    const { challenges, errors } = readContent("content");
    expect(errors).toEqual([]);
    expect(challenges).toHaveLength(6);
    expect(Object.keys(challengeArt).sort()).toEqual(
      challenges.map((challenge) => challenge.key).sort(),
    );
    expect(
      new Set(Object.values(challengeArt).map((art) => art.scene)).size,
    ).toBe(6);
    for (const challenge of challenges) {
      expect(getChallengeArtKey(challenge.description)).toBe(challenge.key);
      expect(getChallengeScene(challenge.description)).not.toBe("fallback");
    }
  });

  it("normalizes harmless formatting edits but does not guess artwork for new content", () => {
    const art = challengeArt.easy_d47c8a58441a;
    expect(
      getChallengeScene(
        `  ${art.description.toUpperCase().replaceAll(" ", "  ")}\n`,
      ),
    ).toBe(art.scene);
    expect(getChallengeScene("Invent a brand-new outdoor challenge")).toBe(
      "fallback",
    );
    expect(getChallengeScene("")).toBe("fallback");
  });
});
