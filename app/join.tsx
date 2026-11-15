import { useConvex, useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Text } from "../components/Typography";
import { Screen } from "../components/Screen";
import { TeamSetupForm } from "../components/TeamSetupForm";
import { TextField } from "../components/TextField";
import { api } from "../convex/_generated/api";
import { ROOM_CODE_LENGTH } from "../convex/constants";
import { normalizeRoomCode } from "../convex/logic/roomCode";
import { useSession } from "../lib/session";
import { colors, font } from "../lib/theme";

const LOOKUP_MESSAGES = {
  not_found: "No room has that code.",
  started: "That game has already started. New teams can't join.",
  expired: "That room has expired.",
  full: "That room is full.",
} as const;

export default function JoinRoom() {
  const convex = useConvex();
  const joinRoom = useMutation(api.rooms.joinRoom);
  const { save } = useSession();
  const [code, setCode] = useState("");

  return (
    <Screen>
      <Text style={styles.lead}>Ask the host for the {ROOM_CODE_LENGTH}-character room code.</Text>
      <TeamSetupForm
        submitLabel="Join room"
        extraFields={
          <TextField
            testID="room-code"
            label="Room code"
            value={code}
            onChangeText={(value) => setCode(normalizeRoomCode(value))}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={ROOM_CODE_LENGTH}
            placeholder="ABC123"
            style={styles.code}
          />
        }
        onSubmit={async (name, sessionToken) => {
          const normalized = normalizeRoomCode(code);
          if (normalized.length !== ROOM_CODE_LENGTH) throw new Error("Enter the full room code.");
          const lookup = await convex.query(api.rooms.lookupLobby, { code: normalized });
          if (lookup.status !== "joinable") throw new Error(LOOKUP_MESSAGES[lookup.status]);
          return await joinRoom({ code: normalized, name, sessionToken });
        }}
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
  code: { fontSize: 24, letterSpacing: 6, fontWeight: "700" },
});
