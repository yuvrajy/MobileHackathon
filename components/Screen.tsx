import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "./Typography";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConvexConnectionState } from "convex/react";
import { colors, font, spacing } from "../lib/theme";

export function Screen({ children, scroll = true, footer }: { children: ReactNode; scroll?: boolean; footer?: ReactNode }) {
  const connection = useConvexConnectionState();
  const offline = !connection.isWebSocketConnected && connection.hasEverConnected;
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      {offline ? (
        <View style={styles.offline} accessibilityRole="alert">
          <Text style={styles.offlineText}>Reconnecting…</Text>
        </View>
      ) : null}
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {body}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, width: "100%", maxWidth: 560, alignSelf: "center", flexGrow: 1 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm, width: "100%", maxWidth: 560, alignSelf: "center", backgroundColor: colors.background },
  offline: { backgroundColor: colors.surface, paddingVertical: spacing.xs, alignItems: "center" },
  offlineText: { color: colors.muted, fontSize: font.small },
});
