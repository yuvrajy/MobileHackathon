import { useQuery } from "convex/react";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { GalleryItem } from "../components/GalleryItem";
import { PunishmentSummary } from "../components/PunishmentSummary";
import { Screen } from "../components/Screen";
import { TeamAvatar } from "../components/TeamAvatar";
import { api } from "../convex/_generated/api";
import { clearPendingProofs } from "../lib/pendingProof";
import { useSession } from "../lib/session";
import { useRoomRoute } from "../lib/useRoomRoute";
import { colors, font, radius, spacing } from "../lib/theme";

export default function Results() {
  const { sessionToken } = useRoomRoute("results");
  const results = useQuery(api.gallery.getResults, sessionToken ? { sessionToken } : "skip");
  const { clear } = useSession();

  const newGame = async () => {
    await clearPendingProofs();
    await clear();
    router.replace("/");
  };

  if (!results) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  const winners = results.standings.filter((s) => s.isWinner);
  const lastPlace = results.standings.find((s) => s.isLastPlace);
  const expiresAt = new Date(results.expiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <Screen footer={<Button testID="new-game" title="New game" onPress={newGame} />}>
      <View style={styles.hero} testID="winner">
        <Text style={styles.heroLabel}>{results.endReason === "deadline" ? "Time's up!" : "Everyone finished!"}</Text>
        <Text style={styles.heroTitle}>
          {winners.length === 1 ? `${winners[0].name} wins!` : winners.length > 1 ? "It's a tie!" : "No winner this time"}
        </Text>
      </View>

      <Text style={styles.section}>Final standings</Text>
      {results.standings.map((s) => (
        <View key={s.teamId} style={styles.standing}>
          <Text style={styles.rank}>{s.rank}</Text>
          <TeamAvatar name={s.name} url={s.avatarUrl} size={40} />
          <Text style={styles.name} numberOfLines={1}>
            {s.name}
            {s.teamId === results.myTeamId ? " (you)" : ""}
          </Text>
          <Text style={styles.count}>{s.completedCount}/3</Text>
        </View>
      ))}

      {results.punishment.kind !== "skip" ? (
        <PunishmentSummary
          punishment={results.punishment}
          label={lastPlace ? `Punishment for ${lastPlace.name}` : "Last place is tied, so no one gets the punishment"}
        />
      ) : null}

      <Text style={styles.section}>Gallery</Text>
      <Text style={styles.note}>
        Room photos and videos are deleted at {expiresAt}. Save the ones you want before starting a new game. Saved copies stay on your phone.
      </Text>
      {results.gallery.length === 0 ? <Text style={styles.note}>No proof was submitted.</Text> : null}
      {results.gallery.map((item) => (
        <GalleryItem key={item.id} item={item} />
      ))}

      {results.bloopers.length > 0 ? (
        <>
          <Text style={styles.section}>Bloopers</Text>
          <Text style={styles.note}>{"Outtakes teams saved along the way. They didn't count as proof."}</Text>
          {results.bloopers.map((item) => (
            <GalleryItem key={item.id} item={item} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", gap: spacing.xs },
  heroLabel: { fontSize: font.small, color: colors.muted, fontWeight: "600" },
  heroTitle: { fontSize: font.title, fontWeight: "800", color: colors.text, textAlign: "center" },
  section: { fontSize: font.heading, fontWeight: "700", color: colors.text, marginTop: spacing.sm },
  standing: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 48 },
  rank: { width: 24, fontSize: font.heading, fontWeight: "800", color: colors.accent, textAlign: "center" },
  name: { flex: 1, fontSize: font.body, color: colors.text },
  count: { fontSize: font.body, fontWeight: "700", color: colors.text },
  note: { fontSize: font.small, color: colors.muted },
});
