import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./Typography";
import { colors } from "../lib/theme";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

export function TeamAvatar({ name, url, size = 44 }: { name: string; url?: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  const shape = { borderWidth: 2, borderColor: colors.text, width: size, height: size, borderRadius: size / 2 };
  if (url && !failed) {
    return <Image source={{ uri: url }} style={[styles.image, shape]} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />;
  }
  return (
    <View style={[styles.fallback, shape]}>
      <Text style={[styles.text, { fontSize: Math.max(16, size * 0.38) }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surface },
  fallback: { backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  text: { color: colors.accentText, fontWeight: "700" },
});
