import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const TOKEN_KEY = "temporary.sessionToken";
const ROOM_KEY = "temporary.roomCode";

export function generateSessionToken(): string {
  return [...Crypto.getRandomBytes(32)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type SessionValue = {
  loaded: boolean;
  sessionToken: string | null;
  roomCode: string | null;
  save: (sessionToken: string, roomCode: string) => Promise<void>;
  clear: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([SecureStore.getItemAsync(TOKEN_KEY), SecureStore.getItemAsync(ROOM_KEY)])
      .then(([token, code]) => {
        setSessionToken(token);
        setRoomCode(code);
      })
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback(async (token: string, code: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(ROOM_KEY, code);
    setSessionToken(token);
    setRoomCode(code);
  }, []);

  const clear = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(ROOM_KEY);
    setSessionToken(null);
    setRoomCode(null);
  }, []);

  const value = useMemo(() => ({ loaded, sessionToken, roomCode, save, clear }), [loaded, sessionToken, roomCode, save, clear]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}

export function useRequiredToken(): string | null {
  return useSession().sessionToken;
}
