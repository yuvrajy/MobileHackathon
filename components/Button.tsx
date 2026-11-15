import { useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Typography";
import Svg, { Path } from "react-native-svg";
import { colors, font, MIN_TOUCH, motion, outline, radius, spacing, typefaces } from "../lib/theme";
import { useReducedMotion } from "../lib/useReducedMotion";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  shape?: "blob" | "splat";
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
};

const SHAPES = {
  blob: "M20 42 C7 17 61 5 115 12 C170 1 251 8 283 25 C314 41 305 84 280 95 C242 114 174 104 122 109 C62 113 8 97 13 68 C11 57 14 48 20 42Z",
  splat: "M35 37 L18 17 Q15 9 30 13 L76 23 L87 6 Q91 1 102 8 L126 23 L160 5 Q168 2 171 12 L176 25 L230 10 Q241 8 237 20 L227 36 L284 30 Q299 29 290 42 L273 56 L301 71 Q311 79 296 84 L257 90 L273 109 Q279 119 264 117 L220 108 L197 126 Q191 131 184 121 L164 105 L126 124 Q116 129 115 117 L110 105 L64 116 Q53 119 58 107 L63 94 L20 98 Q7 98 14 87 L34 71 L7 59 Q0 51 15 47Z",
};

export function Button({ title, onPress, variant = "primary", shape, disabled, loading, testID }: Props) {
  const [progress] = useState(() => new Animated.Value(0));
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const inactive = Boolean(disabled || loading);
  const fill = variant === "danger" ? colors.coral : shape === "blob" ? colors.purple : variant === "secondary" ? colors.white : colors.accent;
  const move = (toValue: number) => {
    if (reduced !== false) {
      progress.setValue(toValue);
      return;
    }
    if (toValue === 0) {
      Animated.spring(progress, { toValue, damping: 16, stiffness: 240, mass: 0.6, useNativeDriver: true }).start();
      return;
    }
    Animated.timing(progress, { toValue, duration: motion.releaseMs / 2, useNativeDriver: true }).start();
  };
  const vector = (shadow: boolean) => (
    <Svg width="100%" height="100%" viewBox={shape === "splat" ? "0 0 310 132" : "0 0 310 120"} preserveAspectRatio="none" style={StyleSheet.absoluteFill} aria-hidden={true}>
      <Path d={SHAPES[shape!]} fill={shadow ? colors.text : fill} stroke={colors.text} strokeWidth={outline} strokeLinejoin="round" />
    </Svg>
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={loading ? `${title}, loading` : title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      onPressIn={() => move(1)}
      onPressOut={() => move(0)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={inactive}
      style={[styles.hit, shape && styles.large, inactive && styles.disabled, focused && styles.focus]}
    >
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shadow, !shape && styles.round, !shape && { backgroundColor: colors.text }]}>{shape ? vector(true) : null}</View>
      <Animated.View pointerEvents="none" style={[styles.face, !shape && styles.round, !shape && { backgroundColor: fill, borderWidth: outline }, { transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, motion.press] }) }, { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, motion.press] }) }] }]}>
        {shape ? vector(false) : null}
        <View style={[styles.label, shape && styles.shapeLabel]}>
          {loading ? <ActivityIndicator color={colors.text} /> : null}
          <Text style={[styles.text, variant === "danger" && { color: colors.danger }]}>{title}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { minHeight: MIN_TOUCH, marginRight: 5, marginBottom: 6 },
  large: { minHeight: 116 },
  round: { borderRadius: radius.md },
  shadow: { backgroundColor: "transparent", transform: [{ translateX: 4 }, { translateY: 5 }] },
  face: { flex: 1, justifyContent: "center", minHeight: MIN_TOUCH, borderColor: colors.text },
  label: { paddingHorizontal: spacing.md, paddingVertical: 12, flexDirection: "row", gap: spacing.sm, justifyContent: "center", alignItems: "center" },
  shapeLabel: { paddingHorizontal: 48, paddingVertical: 34 },
  text: { fontSize: font.body + 2, fontFamily: typefaces.display, fontWeight: "800", color: colors.text, textAlign: "center", flexShrink: 1 },
  disabled: { opacity: 0.5 },
  focus: { outlineColor: colors.text, outlineWidth: 3, outlineOffset: 5 },
});
