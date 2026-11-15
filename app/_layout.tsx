import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CONVEX_URL } from "../lib/config";
import { SessionProvider } from "../lib/session";
import { colors } from "../lib/theme";

const convex = new ConvexReactClient(CONVEX_URL, { unsavedChangesWarning: false });

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <SessionProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              contentStyle: { backgroundColor: colors.background },
              headerBackButtonDisplayMode: "minimal",
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="create" options={{ title: "Create room" }} />
            <Stack.Screen name="join" options={{ title: "Join room" }} />
            <Stack.Screen name="how-to-play" options={{ title: "How to play" }} />
            <Stack.Screen name="lobby" options={{ title: "Lobby", headerBackVisible: false, gestureEnabled: false }} />
            <Stack.Screen name="punishment" options={{ title: "Punishment" }} />
            <Stack.Screen name="advanced" options={{ title: "Advanced", presentation: "modal" }} />
            <Stack.Screen name="game" options={{ title: "Game", headerBackVisible: false, gestureEnabled: false }} />
            <Stack.Screen name="capture" options={{ headerShown: false, presentation: "fullScreenModal" }} />
            <Stack.Screen name="results" options={{ title: "Results", headerBackVisible: false, gestureEnabled: false }} />
            <Stack.Screen name="expired" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
        </SafeAreaProvider>
      </SessionProvider>
    </ConvexProvider>
  );
}
