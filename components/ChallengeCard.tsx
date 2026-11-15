import { StyleSheet, View } from "react-native";
import { Text } from "./Typography";
import { Button } from "./Button";
import { ChallengeIllustration } from "./ChallengeIllustration";
import { colors, font, radius, spacing } from "../lib/theme";

type Props = {
  description: string;
  difficulty: "easy" | "medium" | "hard";
  state: "not_started" | "uploading" | "unsent" | "completed";
  onCapture: () => void;
  onRetry?: () => void;
};

const LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;

export function ChallengeCard({ description, difficulty, state, onCapture, onRetry }: Props) {
  const completed = state === "completed";
  return (
    <View style={[styles.card, completed && styles.completed]} testID={`challenge-${difficulty}`}>
      <View style={[styles.header, { borderBottomColor: difficulty === "easy" ? colors.yellow : difficulty === "medium" ? colors.purple : colors.coral }]}>
        <Text style={styles.tier}>{LABEL[difficulty]}</Text>
        {completed ? <Text style={styles.done}>✓ Completed</Text> : null}
        {state === "uploading" ? <Text style={styles.status}>Uploading…</Text> : null}
        {state === "unsent" ? <Text style={styles.status}>Not sent yet</Text> : null}
      </View>
      <View style={styles.art}><ChallengeIllustration description={description} size={120} /></View>
      <Text style={styles.description}>{description}</Text>
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
  card: { borderWidth: 3, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, backgroundColor: colors.white },
  art: { alignItems: "center" },
  completed: { backgroundColor: colors.surface },
  header: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "space-between", alignItems: "center", borderBottomWidth: 6, paddingBottom: spacing.sm },
  tier: { fontSize: font.body, fontWeight: "800", color: colors.text },
  done: { fontSize: font.small, fontWeight: "700", color: colors.success },
  status: { fontSize: font.small, color: colors.muted },
  description: { fontSize: 22, fontWeight: "700", color: colors.text, lineHeight: 30 },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
});
