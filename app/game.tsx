import { useQuery } from "convex/react";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { ChallengeCard } from "../components/ChallengeCard";
import { Countdown } from "../components/Countdown";
import { Leaderboard } from "../components/Leaderboard";
import { Screen } from "../components/Screen";
import { api } from "../convex/_generated/api";
import { challengeIcon } from "../lib/challengeIcons";
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

  return (
    <Screen>
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

      {game.assignments.map((a) => (
        <ChallengeCard
          key={a.id}
          description={a.description}
          icon={challengeIcon(a.challengeKey)}
          difficulty={a.difficulty}
          state={a.status === "completed" ? "completed" : uploading === a.id ? "uploading" : pending[a.id] ? "unsent" : "not_started"}
          onCapture={() => router.push({ pathname: "/capture", params: { assignmentId: a.id, description: a.description } })}
          onRetry={() => retry(a.id)}
        />
      ))}

      <Text style={styles.section}>Leaderboard</Text>
      <Leaderboard rows={game.leaderboard} myTeamId={game.myTeamId} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: spacing.xs },
  context: { fontSize: font.small, color: colors.muted },
  banner: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  bannerText: { fontSize: font.body, color: colors.success, fontWeight: "600", textAlign: "center" },
  section: { fontSize: font.heading, fontWeight: "700", color: colors.text, marginTop: spacing.sm },
});
