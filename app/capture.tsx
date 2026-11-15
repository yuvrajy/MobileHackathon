import { CameraView, useCameraPermissions, useMicrophonePermissions, type CameraMode } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { ProofPreview } from "../components/ProofPreview";
import { MAX_VIDEO_SECONDS } from "../convex/constants";
import { deleteLocalFile, mimeTypeForUri, PermissionDeniedError, persistCapture, saveLocalFileToLibrary } from "../lib/media";
import { useSession } from "../lib/session";
import { useSubmitProof } from "../lib/useSubmitProof";
import { colors, font, MIN_TOUCH, radius, spacing } from "../lib/theme";

type Capture = { uri: string; mediaType: "photo" | "video"; durationSeconds?: number };

export default function CaptureProof() {
  const { assignmentId, description } = useLocalSearchParams<{ assignmentId: string; description: string }>();
  const { sessionToken } = useSession();
  const submitProof = useSubmitProof(sessionToken);
  const camera = useRef<CameraView>(null);
  const [cameraPermission, requestCamera] = useCameraPermissions();
  const [micPermission, requestMic] = useMicrophonePermissions();
  const [mode, setMode] = useState<CameraMode>("picture");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [capture, setCapture] = useState<Capture | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingBlooper, setSavingBlooper] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const recordStart = useRef(0);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - recordStart.current) / 1000)), 250);
    return () => clearInterval(id);
  }, [recording]);

  if (!cameraPermission) return <View style={styles.dark} />;

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.permission}>
        <Text style={styles.permissionText}>TEMPORARY needs the camera to capture challenge proof.</Text>
        <Button
          title={cameraPermission.canAskAgain ? "Allow camera" : "Open Settings"}
          onPress={() => (cameraPermission.canAskAgain ? requestCamera() : Linking.openSettings())}
        />
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    const photo = await camera.current?.takePictureAsync({ quality: 0.6 });
    if (photo) setCapture({ uri: photo.uri, mediaType: "photo" });
  };

  const startRecording = async () => {
    if (!micPermission?.granted) {
      const result = await requestMic();
      if (!result.granted) {
        Alert.alert("Microphone access needed", "Allow the microphone in Settings to record video proof, or take a photo instead.");
        return;
      }
    }
    setRecording(true);
    setElapsed(0);
    recordStart.current = Date.now();
    try {
      const video = await camera.current?.recordAsync({ maxDuration: MAX_VIDEO_SECONDS });
      const durationSeconds = Math.min(MAX_VIDEO_SECONDS, Math.ceil((Date.now() - recordStart.current) / 1000));
      if (video) setCapture({ uri: video.uri, mediaType: "video", durationSeconds });
    } catch {
      setMessage("Recording failed. Try again.");
    } finally {
      setRecording(false);
    }
  };

  const retake = () => {
    if (capture) deleteLocalFile(capture.uri);
    setCapture(null);
    setMessage(null);
  };

  const saveBlooper = async () => {
    if (!capture) return;
    setSavingBlooper(true);
    try {
      await saveLocalFileToLibrary(capture.uri);
      setMessage("Saved to your camera roll as a blooper. It doesn't count as proof.");
    } catch (error) {
      setMessage(error instanceof PermissionDeniedError ? "Allow photo library access in Settings to save bloopers." : "Couldn't save. Try again.");
    } finally {
      setSavingBlooper(false);
    }
  };

  const submit = async () => {
    if (!capture || !assignmentId) return;
    setSubmitting(true);
    setMessage(null);
    const uri = persistCapture(capture.uri);
    const outcome = await submitProof({
      assignmentId,
      uri,
      mediaType: capture.mediaType,
      mimeType: mimeTypeForUri(uri, capture.mediaType),
      durationSeconds: capture.durationSeconds,
    });
    setSubmitting(false);
    if (outcome.ok) {
      router.back();
      return;
    }
    if (outcome.retryable) {
      Alert.alert("Not sent yet", `${outcome.message}\n\nYour proof is saved on this phone. Retry from the challenge card.`);
      router.back();
      return;
    }
    setMessage(outcome.message);
  };

  if (capture) {
    return (
      <SafeAreaView style={styles.previewWrap}>
        <Text style={styles.challenge} numberOfLines={3}>
          {description}
        </Text>
        <ProofPreview uri={capture.uri} mediaType={capture.mediaType} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Button testID="submit-proof" title="Submit" onPress={submit} loading={submitting} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button title="Retake" variant="secondary" onPress={retake} disabled={submitting} />
          </View>
          <View style={styles.flex}>
            <Button title="Save as Blooper" variant="secondary" onPress={saveBlooper} loading={savingBlooper} disabled={submitting} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.dark}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} mode={mode} facing="back" />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} disabled={recording} style={styles.close} accessibilityRole="button" accessibilityLabel="Close camera">
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Text style={styles.overlayChallenge} numberOfLines={3}>
            {description}
          </Text>
        </View>
        <View style={styles.bottom}>
          {recording ? (
            <Text style={styles.timer}>
              {elapsed}s / {MAX_VIDEO_SECONDS}s
            </Text>
          ) : (
            <View style={styles.modes}>
              {(["picture", "video"] as const).map((m) => (
                <Pressable key={m} onPress={() => setMode(m)} style={[styles.mode, mode === m && styles.modeActive]} accessibilityRole="button">
                  <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>{m === "picture" ? "Photo" : "Video"}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            testID="shutter"
            accessibilityRole="button"
            accessibilityLabel={mode === "picture" ? "Take photo" : recording ? "Stop recording" : "Start recording"}
            onPress={() => (mode === "picture" ? takePhoto() : recording ? camera.current?.stopRecording() : startRecording())}
            style={[styles.shutter, mode === "video" && styles.shutterVideo, recording && styles.shutterRecording]}
          />
          {message ? <Text style={styles.overlayMessage}>{message}</Text> : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: "#000" },
  overlay: { flex: 1, justifyContent: "space-between" },
  top: { padding: spacing.md, gap: spacing.sm },
  close: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm },
  closeText: { color: "#fff", fontSize: font.body, fontWeight: "600" },
  overlayChallenge: { color: "#fff", fontSize: font.body, backgroundColor: "rgba(0,0,0,0.5)", padding: spacing.sm, borderRadius: radius.md },
  bottom: { alignItems: "center", gap: spacing.md, paddingBottom: spacing.lg },
  modes: { flexDirection: "row", gap: spacing.sm },
  mode: { paddingHorizontal: spacing.md, minHeight: 40, justifyContent: "center", borderRadius: radius.pill },
  modeActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  modeText: { color: "#ddd", fontSize: font.body },
  modeTextActive: { color: "#fff", fontWeight: "700" },
  timer: { color: "#fff", fontSize: font.heading, fontWeight: "700", fontVariant: ["tabular-nums"] },
  shutter: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#fff", borderWidth: 5, borderColor: "rgba(255,255,255,0.5)" },
  shutterVideo: { backgroundColor: colors.danger },
  shutterRecording: { borderRadius: 12, width: 56, height: 56 },
  overlayMessage: { color: "#fff", fontSize: font.small },
  permission: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center", backgroundColor: colors.background },
  permissionText: { fontSize: font.body, color: colors.text, textAlign: "center" },
  previewWrap: { flex: 1, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.background },
  challenge: { fontSize: font.body, color: colors.text, fontWeight: "600" },
  message: { fontSize: font.small, color: colors.muted, textAlign: "center" },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1, minHeight: MIN_TOUCH },
});
