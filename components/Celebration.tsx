import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "expo-router";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, motion } from "../lib/theme";
import { useReducedMotion } from "../lib/useReducedMotion";

const palette = [colors.purple, colors.accent, colors.yellow, colors.coral];
const claimed = new Set<string>();

export function Celebration({ eventKey, confirmed }: { eventKey: string; confirmed: boolean }) {
  const focused = useIsFocused();
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!confirmed || !focused || reduced === null || claimed.has(eventKey)) return;
    let active = true;
    const key = `touchgrass.celebration.${eventKey}`;
    AsyncStorage.getItem(key).then(async (seen) => {
      if (!active || seen || claimed.has(eventKey)) return;
      claimed.add(eventKey);
      await AsyncStorage.setItem(key, "1");
      if (!active || reduced) return;
      setVisible(true);
      progress.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: motion.celebrateMs, useNativeDriver: true }).start(() => { if (active) setVisible(false); });
    }).catch(() => {});
    return () => { active = false; progress.stopAnimation(); setVisible(false); };
  }, [confirmed, eventKey, focused, progress, reduced]);
  if (!focused || !visible || reduced !== false) return null;
  return (
    <View pointerEvents="none" accessible={false} style={styles.burst}>
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return <Animated.View key={i} style={[styles.paper, {
          backgroundColor: palette[i % 4], borderRadius: i % 3 === 0 ? 8 : 1,
          opacity: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * 140] }) },
            { translateY: progress.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, Math.sin(angle) * 80 - 25, Math.sin(angle) * 80 + 60] }) },
            { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${i * 47}deg`] }) },
          ],
        }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  burst: { height: 0, alignItems: "center", zIndex: 5 },
  paper: { position: "absolute", top: 40, width: 8, height: 12 },
});
