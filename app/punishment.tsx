import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../components/Typography";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { api } from "../convex/_generated/api";
import { CUSTOM_PUNISHMENT_MAX_LENGTH } from "../convex/constants";
import { errorMessage } from "../lib/errors";
import { useSession } from "../lib/session";
import { colors, font, MIN_TOUCH, radius, spacing } from "../lib/theme";

type Choice = { kind: "skip" } | { kind: "preset"; presetKey: string } | { kind: "custom" };

type Current = { kind: "skip" } | { kind: "preset"; presetKey: string; text: string } | { kind: "custom"; text: string };

export default function PunishmentSetup() {
  const { sessionToken } = useSession();
  const lobby = useQuery(api.rooms.getLobby, sessionToken ? { sessionToken } : "skip");

  useEffect(() => {
    if (lobby && (!lobby.isHost || lobby.status !== "lobby")) router.back();
  }, [lobby]);

  if (!lobby || !sessionToken) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }
  return <PunishmentForm sessionToken={sessionToken} current={lobby.punishment} />;
}

function PunishmentForm({ sessionToken, current }: { sessionToken: string; current: Current }) {
  const presets = useQuery(api.content.listPunishments, {});
  const setPunishment = useMutation(api.rooms.setPunishment);
  const [choice, setChoice] = useState<Choice>(current.kind === "preset" ? { kind: "preset", presetKey: current.presetKey } : { kind: current.kind });
  const [customText, setCustomText] = useState(current.kind === "custom" ? current.text : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await setPunishment({
        sessionToken,
        kind: choice.kind,
        presetKey: choice.kind === "preset" ? choice.presetKey : undefined,
        customText: choice.kind === "custom" ? customText : undefined,
      });
      router.back();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const option = (key: string, label: string, selected: boolean, onPress: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[styles.option, selected && styles.selected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.optionText, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen footer={<Button title="Save" onPress={save} loading={saving} />}>
      <Text style={styles.lead}>{"Pick something light for last place. It's always optional - nobody has to do it."}</Text>
      {option("skip", "Skip - no punishment", choice.kind === "skip", () => setChoice({ kind: "skip" }))}
      {(presets ?? []).map((p) =>
        option(p.key, p.description, choice.kind === "preset" && choice.presetKey === p.key, () =>
          setChoice({ kind: "preset", presetKey: p.key }),
        ),
      )}
      {option("custom", "Write your own", choice.kind === "custom", () => setChoice({ kind: "custom" }))}
      {choice.kind === "custom" ? (
        <View>
          <TextField
            label="Custom punishment"
            value={customText}
            onChangeText={setCustomText}
            maxLength={CUSTOM_PUNISHMENT_MAX_LENGTH}
            placeholder="Keep it safe, kind and optional"
            multiline
          />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: font.body, color: colors.muted },
  option: {
    minHeight: MIN_TOUCH,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
  },
  selected: { borderColor: colors.text, backgroundColor: colors.accent, borderWidth: 3 },
  optionText: { fontSize: font.body, color: colors.text },
  selectedText: { fontWeight: "600" },
  error: { color: colors.danger, fontSize: font.small },
});
