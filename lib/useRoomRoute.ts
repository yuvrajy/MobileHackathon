import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect } from "react";
import { api } from "../convex/_generated/api";
import { useSession } from "./session";

export type RoomScreen = "lobby" | "game" | "results";

const SCREEN_FOR_STATE = { lobby: "/lobby", active: "/game", results: "/results" } as const;

export function routeForState(state: string): string | null {
  if (state === "expired") return "/expired";
  if (state === "none") return "/";
  return SCREEN_FOR_STATE[state as keyof typeof SCREEN_FOR_STATE] ?? null;
}

export function useRoomRoute(screen: RoomScreen) {
  const { sessionToken, roomCode, clear, loaded } = useSession();
  const session = useQuery(api.rooms.getSession, sessionToken ? { sessionToken, roomCode: roomCode ?? undefined } : "skip");

  useEffect(() => {
    if (loaded && !sessionToken) {
      router.replace("/");
      return;
    }
    if (!session) return;
    if (session.state === "none") {
      clear().then(() => router.replace("/"));
      return;
    }
    const target = routeForState(session.state);
    if (target && target !== `/${screen}`) router.replace(target as never);
  }, [session, screen, sessionToken, loaded, clear]);

  return { sessionToken, session };
}
