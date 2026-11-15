import { StyleSheet } from "react-native";
import { Text } from "../components/Typography";
import { Screen } from "../components/Screen";
import { colors, font } from "../lib/theme";

const STEPS = [
  ["Make teams", "Split into teams, usually two friends sharing one phone. One team creates a room; the rest join with its code."],
  ["Get three challenges", "When the host starts, every team gets one easy, one medium and one hard challenge. No two teams get the same one."],
  ["Bring back proof", "Complete each challenge and capture a photo or a video up to 60 seconds in the app. One proof per challenge."],
  ["Twenty minutes", "The game ends when every team finishes all three, or when the 20-minute timer runs out."],
  ["Ranking", "First team to finish all three wins. Otherwise, most challenges completed wins."],
  ["Gallery", "At the end, everyone sees and can save every proof. Room media is deleted 30 minutes after the deadline."],
  ["Punishment", "The host picks a punishment for last place or writes their own."],
  ["Play safe", "Ask before filming anyone, follow store rules, and never do anything dangerous or unkind."],
];

export default function HowToPlay() {
  return (
    <Screen>
      {STEPS.map(([title, body]) => (
        <Text key={title} style={styles.body}>
          <Text style={styles.title}>{title}. </Text>
          {body}
        </Text>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "700", color: colors.text },
  body: { fontSize: font.body, color: colors.text, lineHeight: 27 },
});
