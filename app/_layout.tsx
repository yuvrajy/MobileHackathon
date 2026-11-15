import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Fredoka_700Bold } from "@expo-google-fonts/fredoka";
import { Nunito_600SemiBold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CONVEX_URL } from "../lib/config";
import { SessionProvider } from "../lib/session";
import { colors, typefaces } from "../lib/theme";

const convex = new ConvexReactClient(CONVEX_URL, { unsavedChangesWarning: false });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_700Bold, Nunito_600SemiBold, Nunito_800ExtraBold });
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center" }}><ActivityIndicator color={colors.text} /></View>;
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
              headerTitleStyle: { fontFamily: typefaces.display, fontSize: 26 },
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
