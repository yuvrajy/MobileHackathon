import { ConvexError } from "convex/values";

const NETWORK_MESSAGE = "Couldn't reach the game server. Check your connection and try again.";

export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data = error.data as { message?: string } | string;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && /network|fetch|timeout|connect/i.test(error.message)) return NETWORK_MESSAGE;
  return "Something went wrong. Please try again.";
}
