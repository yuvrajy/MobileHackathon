import { StyleSheet, Text } from "react-native";
import { formatCountdown, useRemainingMs } from "../lib/time";
import { colors, font } from "../lib/theme";

export function Countdown({ endsAt }: { endsAt: number }) {
  const remaining = useRemainingMs(endsAt);
  return (
    <Text style={styles.text} accessibilityLabel={`Time left ${formatCountdown(remaining)}`} testID="countdown">
      {formatCountdown(remaining)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 44, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"], textAlign: "center" },
});

export const countdownFont = font.title;
