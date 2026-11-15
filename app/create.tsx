import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Text } from "../components/Typography";
import { Screen } from "../components/Screen";
import { TeamSetupForm } from "../components/TeamSetupForm";
import { TextField } from "../components/TextField";
import { api } from "../convex/_generated/api";
import { TEST_ROOMS_ENABLED } from "../lib/config";
import { useSession } from "../lib/session";
import { colors, font } from "../lib/theme";

export default function CreateRoom() {
  const createRoom = useMutation(api.rooms.createRoom);
  const { save } = useSession();
  const [testMinutes, setTestMinutes] = useState("");

  return (
    <Screen>
      <Text style={styles.lead}>{"You'll be the host. Friends join with the room code."}</Text>
      <TeamSetupForm
        submitLabel="Create room"
        extraFields={
          TEST_ROOMS_ENABLED ? (
            <TextField
              label="Test game length in minutes (dev only, blank for 2 hours)"
              value={testMinutes}
              onChangeText={setTestMinutes}
              keyboardType="number-pad"
            />
          ) : null
        }
        onSubmit={(name, sessionToken) =>
          createRoom({
            name,
            sessionToken,
            testDurationMinutes: TEST_ROOMS_ENABLED && testMinutes.trim() ? Number(testMinutes) : undefined,
          })
        }
        onDone={async (sessionToken, roomCode) => {
          await save(sessionToken, roomCode);
          router.replace("/lobby");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: font.body, color: colors.muted },
});
