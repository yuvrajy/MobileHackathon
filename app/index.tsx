import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { api } from "../convex/_generated/api";
import { useSession } from "../lib/session";
import { routeForState } from "../lib/useRoomRoute";
import { colors, font, spacing } from "../lib/theme";

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
    <Screen scroll={false}>
      <View style={styles.center}>
        <Text style={styles.title} accessibilityRole="header">
          touch grass
        </Text>
        <Text style={styles.subtitle}>Split into teams. Three challenges. Two hours. Bring back the proof.</Text>
      </View>
      <View style={styles.actions}>
        <Button testID="create-room" title="Create room" onPress={() => router.push("/create")} />
        <Button testID="join-room" title="Join room" variant="secondary" onPress={() => router.push("/join")} />
        <Button testID="how-to-play" title="How to play" variant="secondary" onPress={() => router.push("/how-to-play")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  title: { fontSize: 40, fontWeight: "800", color: colors.text, letterSpacing: 2 },
  subtitle: { fontSize: font.body, color: colors.muted, textAlign: "center", maxWidth: 300 },
  muted: { color: colors.muted, fontSize: font.body },
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
});
