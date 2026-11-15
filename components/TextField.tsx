import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, font, MIN_TOUCH, radius, spacing } from "../lib/theme";

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel={label} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontSize: font.small, color: colors.muted, fontWeight: "600" },
  input: {
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
});
