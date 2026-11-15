import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../lib/theme";

type Punishment = { kind: "skip" } | { kind: "preset"; presetKey: string; text: string } | { kind: "custom"; text: string };

export function PunishmentSummary({ punishment, label = "Punishment for last place" }: { punishment: Punishment; label?: string }) {
  return (
    <View style={styles.box} testID="punishment-summary">
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.text}>{punishment.kind === "skip" ? "None - just bragging rights." : punishment.text}</Text>
      {punishment.kind !== "skip" ? <Text style={styles.note}>Optional. Nobody has to do it.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  label: { fontSize: font.small, color: colors.muted, fontWeight: "600" },
  text: { fontSize: font.body, color: colors.text },
  note: { fontSize: font.small, color: colors.muted },
});
