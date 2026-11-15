export const challengeArt = {
  easy_bfd241503f42: {
    scene: "mannequin",
    description: "Strike a pose with a mannequin",
  },
  easy_d47c8a58441a: {
    scene: "petDog",
    description: "Pet a dog (ask the owner first)",
  },
  medium_3e4957978faa: {
    scene: "bottleFlip",
    description: "Hit a bottle flip and film it landing",
  },
  medium_bfe13854b1b1: {
    scene: "baristaSelfie",
    description: "Take a selfie with a barista (ask them first!)",
  },
  hard_4b1db9740502: {
    scene: "seaLion",
    description:
      "Hit the sea lion: lie on your stomach, grab your ankles and bounce while you film it",
  },
  hard_e2fceadb801e: {
    scene: "waterSplash",
    description: "Get someone to splash water in your face",
  },
} as const;

export type ChallengeArtKey = keyof typeof challengeArt;
export type ChallengeScene = (typeof challengeArt)[ChallengeArtKey]["scene"];

const normalize = (description: string) =>
  description.trim().replace(/\s+/g, " ").toLowerCase();
const descriptionKeys = new Map<string, ChallengeArtKey>(
  (Object.keys(challengeArt) as ChallengeArtKey[]).map((key) => [
    normalize(challengeArt[key].description),
    key,
  ]),
);

export function getChallengeArtKey(
  description: string,
): ChallengeArtKey | undefined {
  return descriptionKeys.get(normalize(description));
}

export function getChallengeScene(
  description: string,
): ChallengeScene | "fallback" {
  const key = getChallengeArtKey(description);
  return key ? challengeArt[key].scene : "fallback";
}
