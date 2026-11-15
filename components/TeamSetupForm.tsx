import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { useRef, useState, type ReactNode } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { TEAM_NAME_MAX_LENGTH } from "../convex/constants";
import { errorMessage } from "../lib/errors";
import { mimeTypeForUri, uploadToConvex } from "../lib/media";
import { generateSessionToken } from "../lib/session";
import { colors, font, spacing } from "../lib/theme";
import { Button } from "./Button";
import { TeamAvatar } from "./TeamAvatar";
import { TextField } from "./TextField";

type Props = {
  submitLabel: string;
  extraFields?: ReactNode;
  onSubmit: (name: string, sessionToken: string) => Promise<{ roomCode: string }>;
  onDone: (sessionToken: string, roomCode: string) => Promise<void>;
};

export function TeamSetupForm({ submitLabel, extraFields, onSubmit, onDone }: Props) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<{ uri: string; mimeType: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const generateAvatarUrl = useMutation(api.rooms.generateAvatarUploadUrl);
  const setAvatar = useMutation(api.rooms.setAvatar);

  const pickPhoto = async (source: "camera" | "library") => {
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5 };
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera access needed", "You can skip the team photo, or allow camera access in Settings.");
        return;
      }
    }
    const result = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPhoto({ uri: asset.uri, mimeType: asset.mimeType ?? mimeTypeForUri(asset.uri, "photo") });
  };

  const choosePhoto = () =>
    Alert.alert("Team photo", "Optional. Initials are used if you skip it.", [
      { text: "Take photo", onPress: () => pickPhoto("camera") },
      { text: "Choose from library", onPress: () => pickPhoto("library") },
      ...(photo ? [{ text: "Remove photo", style: "destructive" as const, onPress: () => setPhoto(null) }] : []),
      { text: "Cancel", style: "cancel" as const },
    ]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a team name.");
      return;
    }
    setBusy(true);
    setError(null);
    tokenRef.current ??= generateSessionToken();
    const sessionToken = tokenRef.current;
    try {
      const { roomCode } = await onSubmit(trimmed, sessionToken);
      if (photo) {
        try {
          const url = await generateAvatarUrl({ sessionToken });
          const storageId = await uploadToConvex(url, photo.uri, photo.mimeType);
          await setAvatar({ sessionToken, storageId: storageId as Id<"_storage"> });
        } catch {
          // The team photo is optional; initials are shown if the upload fails.
        }
      }
      await onDone(sessionToken, roomCode);
    } catch (e) {
      setError(errorMessage(e));
      if (/another room/.test(errorMessage(e))) tokenRef.current = null;
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {extraFields}
      <TextField
        testID="team-name"
        label="Team name"
        value={name}
        onChangeText={setName}
        maxLength={TEAM_NAME_MAX_LENGTH}
        autoCapitalize="words"
        returnKeyType="done"
        placeholder="e.g. Food Court Legends"
      />
      <Pressable onPress={choosePhoto} style={styles.photoRow} accessibilityRole="button" accessibilityLabel="Add team photo">
        <TeamAvatar name={name || "?"} url={photo?.uri} size={56} />
        <Text style={styles.photoText}>{photo ? "Change team photo" : "Add team photo (optional)"}</Text>
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button testID="submit-team" title={submitLabel} onPress={submit} loading={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  photoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 56 },
  photoText: { fontSize: font.body, color: colors.accent, fontWeight: "600" },
  error: { color: colors.danger, fontSize: font.small },
});
