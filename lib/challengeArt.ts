export const challengeArt = {
  easy_ccf0f2f23fce: {
    scene: "teamColor",
    description:
      "Take a team photo with something that is your team's favorite color",
  },
  easy_a8c98a24b17d: {
    scene: "storeSign",
    description:
      "Find a store sign that starts with the first letter of a teammate's name",
  },
  easy_e06cee13d23d: {
    scene: "superhero",
    description: "Strike a superhero pose next to a fountain, plant or statue",
  },
  easy_a39018995462: {
    scene: "shoes",
    description: "Find three different kinds of shoes in a single shop window",
  },
  easy_f2c07580fe87: {
    scene: "tallest",
    description: "Take a photo with the tallest thing you can find indoors",
  },
  easy_6e55caf8cfbd: {
    scene: "menu",
    description: "Show a menu item you've never heard of",
  },
  easy_6067017c8f8f: {
    scene: "numberSign",
    description: "Get a photo of a sign with a number bigger than 100",
  },
  easy_8f848f436b32: {
    scene: "album",
    description: "Re-create a famous album cover pose in a public space",
  },
  medium_40fc3daf8d90: {
    scene: "slowWalk",
    description:
      "Record a 10-second slow-motion walk like you're in a movie trailer",
  },
  medium_a53b110a0cbc: {
    scene: "rainbow",
    description:
      "Find and photograph something from every color of the rainbow in one store",
  },
  medium_1bc621f535bf: {
    scene: "commercial",
    description:
      "Film a 15-second fake commercial for a product you can see (don't film other shoppers)",
  },
  medium_ed0ff773eeb2: {
    scene: "perspective",
    description: "Take a photo that makes a small object look gigantic",
  },
  medium_b7a739178505: {
    scene: "humanLetters",
    description: "Make a human letter T, M and P with your team and film it",
  },
  medium_e7d18c5ad330: {
    scene: "mannequin",
    description: "Find a mannequin and copy its exact pose",
  },
  medium_79e12abaed8f: {
    scene: "reunion",
    description: "Film a dramatic 'reunion' scene on an escalator or staircase",
  },
  medium_f23420eaa980: {
    scene: "reflection",
    description: "Photograph a reflection that looks like a different place",
  },
  hard_02da1371193c: {
    scene: "documentary",
    description:
      "Film a 30-second nature-documentary narration about your teammate shopping",
  },
  hard_f2a3a6c6df28: {
    scene: "employee",
    description:
      "Get a store employee to share their favorite item in the store and photograph it (only if they agree)",
  },
  hard_1acbbe420193: {
    scene: "movie",
    description:
      "Recreate a movie scene in under 45 seconds using only things around you",
  },
  hard_f36eb951afa9: {
    scene: "installation",
    description:
      "Build a tiny 'art installation' out of receipts or napkins and photograph it, then clean up",
  },
  hard_5502a556666a: {
    scene: "rhymes",
    description: "Find five things that rhyme and film yourselves naming them",
  },
  hard_9a28c3ac75e7: {
    scene: "cooking",
    description:
      "Film a full 'cooking show' intro at the food court without buying anything",
  },
  hard_eb34596799cf: {
    scene: "floating",
    description: "Take a photo where it looks like your team is floating",
  },
  hard_6e6896668eae: {
    scene: "musicVideo",
    description:
      "Film a one-take mini music video with a made-up 20-second song about the mall",
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
