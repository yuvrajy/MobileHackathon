import { useVideoPlayer, VideoView } from "expo-video";
import { Image, StyleSheet, View } from "react-native";
import { colors, radius } from "../lib/theme";

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });
  return <VideoView player={player} style={styles.media} contentFit="contain" nativeControls />;
}

export function ProofPreview({ uri, mediaType }: { uri: string; mediaType: "photo" | "video" }) {
  return (
    <View style={styles.frame}>
      {mediaType === "video" ? <VideoPreview uri={uri} /> : <Image source={{ uri }} style={styles.media} resizeMode="contain" />}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.text },
  media: { flex: 1, width: "100%" },
});
