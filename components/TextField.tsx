import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { Text } from "./Typography";
import { colors, font, MIN_TOUCH, outline, radius, spacing, typefaces } from "../lib/theme";

export function TextField({ label, style, onFocus, onBlur, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, focused && styles.focused, style]}
        accessibilityLabel={label}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { fontSize: font.body, color: colors.text, fontWeight: "700" },
  input: { minHeight: MIN_TOUCH + 8, borderWidth: outline, borderColor: colors.text, borderRadius: radius.md, padding: spacing.md, fontSize: font.body + 2, fontFamily: typefaces.body, color: colors.text, backgroundColor: colors.white },
  focused: { borderColor: colors.success, backgroundColor: "#F0FAD8" },
});
