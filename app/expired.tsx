import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { useSession } from "../lib/session";
import { clearPendingProofs } from "../lib/pendingProof";
import { colors, font, spacing } from "../lib/theme";

export default function Expired() {
  const { clear } = useSession();
  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <Text style={styles.title}>This room has ended</Text>
        <Text style={styles.body}>Its photos and videos have been deleted. Anything you saved is still on your phone.</Text>
      </View>
      <Button
        title="Back to home"
        onPress={async () => {
          await clearPendingProofs();
          await clear();
          router.replace("/");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", gap: spacing.md },
  title: { fontSize: font.title, fontWeight: "800", color: colors.text, textAlign: "center" },
  body: { fontSize: font.body, color: colors.muted, textAlign: "center" },
});
