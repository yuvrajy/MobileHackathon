import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Button } from "./Button";
import { PermissionDeniedError, saveRemoteFileToLibrary } from "../lib/media";
import { colors, font, radius, spacing } from "../lib/theme";

type Item = {
  id: string;
  teamName: string;
  challenge: string;
  difficulty: string;
  mediaType: "photo" | "video";
  mimeType: string;
  url: string | null;
};

function RemoteVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url);
  return <VideoView player={player} style={styles.media} contentFit="cover" nativeControls />;
}

export function extensionFor(mimeType: string): string {
  if (mimeType === "video/mp4") return "mp4";
  if (mimeType === "video/quicktime") return "mov";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/heic" || mimeType === "image/heif") return "heic";
  return "jpg";
}

export function GalleryItem({ item }: { item: Item }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!item.url) return null;
  const url = item.url;

  const save = async () => {
    setSaving(true);
    try {
      await saveRemoteFileToLibrary(url, extensionFor(item.mimeType));
      setSaved(true);
    } catch (error) {
      Alert.alert(
        "Couldn't save",
        error instanceof PermissionDeniedError ? "Allow photo library access in Settings to save." : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      {item.mediaType === "video" ? <RemoteVideo url={url} /> : <Image source={{ uri: url }} style={styles.media} resizeMode="cover" />}
      <View style={styles.body}>
        <Text style={styles.team}>{item.teamName}</Text>
        <Text style={styles.challenge}>{item.challenge}</Text>
        <Button title={saved ? "Saved" : "Save to device"} variant="secondary" onPress={save} loading={saving} disabled={saved} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: "hidden" },
  media: { width: "100%", aspectRatio: 1, backgroundColor: colors.surface },
  body: { padding: spacing.md, gap: spacing.sm },
  team: { fontSize: font.small, fontWeight: "700", color: colors.accent },
  challenge: { fontSize: font.body, color: colors.text },
});
