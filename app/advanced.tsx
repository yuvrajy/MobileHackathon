import { StyleSheet, Text } from "react-native";
import { Screen } from "../components/Screen";
import { colors, font } from "../lib/theme";

const PLANNED = [
  "Custom game length",
  "Pick an environment (mall, downtown, anywhere)",
  "Solo mode toggle",
  "Late joining",
  "Custom challenge lists",
  "Other ways to judge proof",
  "Detailed live progress",
  "One same-difficulty challenge reroll per team",
];

export default function Advanced() {
  return (
    <Screen>
      <Text style={styles.lead}>{"Coming later. These options don't work yet and don't change this game."}</Text>
      {PLANNED.map((item) => (
        <Text key={item} style={styles.item}>
          •  {item}
        </Text>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: font.body, color: colors.muted },
  item: { fontSize: font.body, color: colors.text },
});
