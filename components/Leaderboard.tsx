import { StyleSheet, Text, View } from "react-native";
import { TeamAvatar } from "./TeamAvatar";
import { colors, font, spacing } from "../lib/theme";

type Row = { id: string; name: string; avatarUrl: string | null; completedCount: number };

export function Leaderboard({ rows, myTeamId }: { rows: Row[]; myTeamId: string }) {
  return (
    <View style={styles.list} testID="leaderboard">
      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <TeamAvatar name={row.name} url={row.avatarUrl} size={36} />
          <Text style={styles.name} numberOfLines={1}>
            {row.name}
            {row.id === myTeamId ? " (you)" : ""}
          </Text>
          <Text style={styles.count}>{row.completedCount}/3</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 44 },
  name: { flex: 1, fontSize: font.body, color: colors.text },
  count: { fontSize: font.body, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
});
