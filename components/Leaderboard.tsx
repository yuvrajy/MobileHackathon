import { StyleSheet, View } from "react-native";
import { Text } from "./Typography";
import { TeamAvatar } from "./TeamAvatar";
import { colors, spacing } from "../lib/theme";

type Row = { id: string; name: string; avatarUrl: string | null; completedCount: number };

export function Leaderboard({ rows, myTeamId }: { rows: Row[]; myTeamId: string }) {
  return (
    <View style={styles.list} testID="leaderboard">
      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <TeamAvatar name={row.name} url={row.avatarUrl} size={36} />
          <Text style={styles.name}>
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
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 60, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: colors.border },
  name: { flex: 1, fontSize: 20, fontWeight: "600", color: colors.text },
  count: { fontSize: 24, fontWeight: "800", color: colors.text, fontVariant: ["tabular-nums"] },
});
