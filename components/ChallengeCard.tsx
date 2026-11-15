import { Image, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { Button } from "./Button";
import { colors, font, radius, spacing } from "../lib/theme";

type Props = {
  description: string;
  icon?: ImageSourcePropType;
  difficulty: "easy" | "medium" | "hard";
  state: "not_started" | "uploading" | "unsent" | "completed";
  onCapture: () => void;
  onRetry?: () => void;
};

const LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;

export function ChallengeCard({ description, icon, difficulty, state, onCapture, onRetry }: Props) {
  const completed = state === "completed";
  return (
    <View style={[styles.card, completed && styles.completed]} testID={`challenge-${difficulty}`}>
      <View style={styles.header}>
        <Text style={styles.tier}>{LABEL[difficulty]}</Text>
        {completed ? <Text style={styles.done}>✓ Completed</Text> : null}
        {state === "uploading" ? <Text style={styles.status}>Uploading…</Text> : null}
        {state === "unsent" ? <Text style={styles.status}>Not sent yet</Text> : null}
      </View>
      <View style={styles.body}>
        {icon ? <Image source={icon} style={styles.icon} accessibilityIgnoresInvertColors /> : null}
        <Text style={[styles.description, styles.flex]}>{description}</Text>
      </View>
      {state === "not_started" ? <Button title="Capture proof" onPress={onCapture} /> : null}
      {state === "unsent" && onRetry ? (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button title="Retry upload" onPress={onRetry} />
          </View>
          <View style={styles.flex}>
            <Button title="Retake" variant="secondary" onPress={onCapture} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  completed: { backgroundColor: colors.surface },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tier: { fontSize: font.small, fontWeight: "700", color: colors.accent, textTransform: "uppercase" },
  done: { fontSize: font.small, fontWeight: "700", color: colors.success },
  status: { fontSize: font.small, color: colors.muted },
  description: { fontSize: font.body, color: colors.text, lineHeight: 22 },
  row: { flexDirection: "row", gap: spacing.sm },
  body: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: { width: 72, height: 72, borderRadius: radius.md },
  flex: { flex: 1 },
});
