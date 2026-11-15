import { useMutation, useQuery } from "convex/react";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { Text } from "../components/Typography";
import { Button } from "../components/Button";
import { ChallengeCard } from "../components/ChallengeCard";
import { Celebration } from "../components/Celebration";
import { Countdown } from "../components/Countdown";
import { Leaderboard } from "../components/Leaderboard";
import { Screen } from "../components/Screen";
import { api } from "../convex/_generated/api";
import { errorMessage } from "../lib/errors";
import { getPendingProofs, type PendingProof } from "../lib/pendingProof";
import { useRoomRoute } from "../lib/useRoomRoute";
import { useSubmitProof } from "../lib/useSubmitProof";
import { colors, font, radius, spacing } from "../lib/theme";

export default function Game() {
  const { sessionToken } = useRoomRoute("game");
  const game = useQuery(api.game.getGame, sessionToken ? { sessionToken } : "skip");
  const submitProof = useSubmitProof(sessionToken);
  const [pending, setPending] = useState<Record<string, PendingProof>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const endRoom = useMutation(api.rooms.endRoom);
  const [ending, setEnding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getPendingProofs().then(setPending);
    }, []),
  );

  if (!game) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  const retry = async (assignmentId: string) => {
    const proof = pending[assignmentId];
    if (!proof) return;
    setUploading(assignmentId);
    const outcome = await submitProof(proof);
    setUploading(null);
    setPending(await getPendingProofs());
    if (!outcome.ok) Alert.alert("Not sent", outcome.message);
  };

  const confirmEnd = () =>
    Alert.alert("End the game for everyone?", "Scores lock in now and everyone goes to the results.", [
      { text: "Keep playing", style: "cancel" },
      {
        text: "End game",
        style: "destructive",
        onPress: async () => {
          setEnding(true);
          try {
            await endRoom({ sessionToken: sessionToken! });
          } catch (e) {
            Alert.alert("Couldn't end the game", errorMessage(e));
            setEnding(false);
          }
        },
      },
    ]);

  return (
    <Screen>
      <Celebration eventKey={`finished-${game.myTeamId}`} confirmed={game.finished} />
      <View style={styles.header}>
        <Text style={styles.context}>
          {game.myTeamName} · Room {game.roomCode}
        </Text>
        <Countdown endsAt={game.endsAt} />
      </View>

      {game.finished ? (
        <View style={styles.banner} testID="finished-banner">
          <Text style={styles.bannerText}>All challenges complete! Waiting for the other teams.</Text>
        </View>
      ) : null}

      <View style={styles.progressHeading}>
        <Text style={styles.section}>Your challenges</Text>
        <Text style={styles.progress}>{game.assignments.filter((a) => a.status === "completed").length} of 3 complete</Text>
      </View>

      {game.assignments.map((a) => (
        <ChallengeCard
          key={a.id}
          description={a.description}
          difficulty={a.difficulty}
          state={a.status === "completed" ? "completed" : uploading === a.id ? "uploading" : pending[a.id] ? "unsent" : "not_started"}
          onCapture={() => router.push({ pathname: "/capture", params: { assignmentId: a.id, description: a.description } })}
          onRetry={() => retry(a.id)}
        />
      ))}

      <Text style={styles.section}>Leaderboard</Text>
      <Leaderboard rows={game.leaderboard} myTeamId={game.myTeamId} />

      {game.isHost ? <Button testID="end-game" title="End game" variant="danger" onPress={confirmEnd} loading={ending} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: spacing.sm, padding: spacing.md, borderWidth: 3, borderColor: colors.text, borderRadius: radius.lg, backgroundColor: colors.yellow },
  progressHeading: { gap: spacing.sm },
  progress: { fontSize: font.body, color: colors.text, fontWeight: "600" },
  context: { fontSize: font.small, color: colors.muted },
  banner: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  bannerText: { fontSize: font.body, color: colors.success, fontWeight: "600", textAlign: "center" },
  section: { fontSize: font.heading, fontWeight: "700", color: colors.text, marginTop: spacing.sm },
});
