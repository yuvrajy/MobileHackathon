import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "../components/Typography";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Doodle } from "../components/Doodle";
import { api } from "../convex/_generated/api";
import { useSession } from "../lib/session";
import { routeForState } from "../lib/useRoomRoute";
import { colors, font, spacing, typefaces } from "../lib/theme";

export default function Home() {
  const { loaded, sessionToken, roomCode, clear } = useSession();
  const session = useQuery(api.rooms.getSession, sessionToken ? { sessionToken, roomCode: roomCode ?? undefined } : "skip");
  const resuming = !loaded || (sessionToken !== null && (session === undefined || session.state !== "none"));

  useEffect(() => {
    if (!session) return;
    if (session.state === "none") {
      clear();
      return;
    }
    const target = routeForState(session.state);
    if (target && target !== "/") router.replace(target as never);
  }, [session, clear]);

  if (resuming) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.muted}>Reconnecting to your room…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.title} accessibilityRole="header">
          touch{"\n"}grass.
        </Text>
        <Doodle size={132} />
        <Text style={styles.subtitle}>Three challenges. Two hours.{"\n"}Go make a story.</Text>
      </View>
      <View style={styles.actions}>
        <Button testID="create-room" title="Create room" shape="blob" onPress={() => router.push("/create")} />
        <Button testID="join-room" title="Join room" shape="splat" onPress={() => router.push("/join")} />
        <Text accessibilityRole="link" onPress={() => router.push("/how-to-play")} style={styles.how}>How to play ↗</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingTop: spacing.xl },
  title: { fontSize: 58, lineHeight: 64, fontFamily: typefaces.display, fontWeight: "900", color: colors.text, letterSpacing: -2, textAlign: "center" },
  subtitle: { fontSize: font.body, color: colors.text, textAlign: "center", lineHeight: 26 },
  muted: { color: colors.muted, fontSize: font.body },
  actions: { gap: spacing.md, paddingBottom: spacing.lg },
  how: { minHeight: 48, textAlign: "center", padding: 14, fontSize: font.body, fontWeight: "700", textDecorationLine: "underline", color: colors.text },
});
