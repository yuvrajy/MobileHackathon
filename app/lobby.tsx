import * as Clipboard from "expo-clipboard";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { PunishmentSummary } from "../components/PunishmentSummary";
import { Screen } from "../components/Screen";
import { TeamAvatar } from "../components/TeamAvatar";
import { api } from "../convex/_generated/api";
import { errorMessage } from "../lib/errors";
import { useRoomRoute } from "../lib/useRoomRoute";
import { colors, font, radius, spacing } from "../lib/theme";

export default function Lobby() {
  const { sessionToken } = useRoomRoute("lobby");
  const lobby = useQuery(api.rooms.getLobby, sessionToken ? { sessionToken } : "skip");
  const startGame = useMutation(api.rooms.startGame);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lobby || !sessionToken) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  const canStart = lobby.teams.length >= lobby.minTeams;
  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      await startGame({ sessionToken });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setStarting(false);
    }
  };

  const copy = async () => {
    await Clipboard.setStringAsync(lobby.roomCode);
    setCopied(true);
  };

  return (
    <Screen
      footer={
        lobby.isHost ? (
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {!canStart ? <Text style={styles.hint}>Waiting for at least {lobby.minTeams} teams.</Text> : null}
            <Button testID="start-game" title="Start game" onPress={start} disabled={!canStart} loading={starting} />
          </>
        ) : (
          <Text style={styles.waiting} testID="waiting-for-host">
            Waiting for host to start…
          </Text>
        )
      }
    >
      <Pressable onPress={copy} style={styles.codeBox} accessibilityRole="button" accessibilityLabel={`Room code ${lobby.roomCode}. Tap to copy.`}>
        <Text style={styles.codeLabel}>Room code</Text>
        <Text style={styles.code} testID="room-code-display" selectable>
          {lobby.roomCode}
        </Text>
        <Text style={styles.copy}>{copied ? "Copied" : "Tap to copy"}</Text>
      </Pressable>
      {lobby.isTestRoom ? <Text style={styles.hint}>Test room: {Math.round(lobby.durationMs / 60000)} minute game.</Text> : null}

      <Text style={styles.section}>Teams ({lobby.teams.length})</Text>
      <View style={styles.teams}>
        {lobby.teams.map((team) => (
          <View key={team.id} style={styles.team}>
            <TeamAvatar name={team.name} url={team.avatarUrl} />
            <Text style={styles.teamName} numberOfLines={1}>
              {team.name}
              {team.id === lobby.myTeamId ? " (you)" : ""}
            </Text>
            {team.isHost ? <Text style={styles.host}>Host</Text> : null}
          </View>
        ))}
      </View>

      <PunishmentSummary punishment={lobby.punishment} />
      {lobby.isHost ? (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button title="Punishment" variant="secondary" onPress={() => router.push("/punishment")} />
          </View>
          <View style={styles.flex}>
            <Button title="Advanced" variant="secondary" onPress={() => router.push("/advanced")} />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeBox: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  codeLabel: { fontSize: font.small, color: colors.muted, fontWeight: "600" },
  code: { fontSize: font.code, fontWeight: "800", letterSpacing: 8, color: colors.text },
  copy: { fontSize: font.small, color: colors.accent },
  section: { fontSize: font.heading, fontWeight: "700", color: colors.text },
  teams: { gap: spacing.sm },
  team: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 48 },
  teamName: { flex: 1, fontSize: font.body, color: colors.text },
  host: { fontSize: font.small, color: colors.accent, fontWeight: "700" },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  hint: { fontSize: font.small, color: colors.muted, textAlign: "center" },
  waiting: { fontSize: font.body, color: colors.muted, textAlign: "center", paddingVertical: spacing.md },
  error: { fontSize: font.small, color: colors.danger, textAlign: "center" },
});
