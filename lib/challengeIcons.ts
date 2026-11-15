import type { ImageSourcePropType } from "react-native";

const ICONS: Record<string, ImageSourcePropType> = {
  easy_bfd241503f42: require("../assets/challenges/mannequin-pose.png"),
  easy_d47c8a58441a: require("../assets/challenges/pet-dog.png"),
  medium_3e4957978faa: require("../assets/challenges/bottle-flip.png"),
  medium_bfe13854b1b1: require("../assets/challenges/barista-selfie.png"),
  hard_4b1db9740502: require("../assets/challenges/sea-lion.png"),
  hard_e2fceadb801e: require("../assets/challenges/water-splash.png"),
};

export function challengeIcon(challengeKey: string): ImageSourcePropType | undefined {
  return ICONS[challengeKey];
}
