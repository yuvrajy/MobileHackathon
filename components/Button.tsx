import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, font, MIN_TOUCH, radius, spacing } from "../lib/theme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
};

export function Button({ title, onPress, variant = "primary", disabled, loading, testID }: Props) {
  const inactive = disabled || loading;
  const primary = variant === "primary";
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        variant === "danger" && styles.danger,
        inactive && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.accentText : colors.accent} />
      ) : (
        <Text style={[styles.text, primary ? styles.primaryText : styles.secondaryText, variant === "danger" && styles.dangerText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.accent },
  danger: { borderColor: colors.danger },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  text: { fontSize: font.body, fontWeight: "600" },
  primaryText: { color: colors.accentText },
  secondaryText: { color: colors.accent },
  dangerText: { color: colors.danger },
});
