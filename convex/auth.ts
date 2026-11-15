import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { fail } from "./errors";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export async function hashSessionToken(token: string): Promise<string> {
  if (!TOKEN_PATTERN.test(token)) fail("INVALID_SESSION", "This device session is not valid.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isRoomExpired(room: Doc<"rooms">, now: number): boolean {
  return room.status === "expired" || (room.expiresAt !== undefined && now >= room.expiresAt);
}

export async function findMembership(ctx: QueryCtx, sessionToken: string) {
  const sessionHash = await hashSessionToken(sessionToken);
  const team = await ctx.db.query("teams").withIndex("by_session", (q) => q.eq("sessionHash", sessionHash)).unique();
  if (!team) return null;
  const room = await ctx.db.get("rooms", team.roomId);
  if (!room) return null;
  return { team, room };
}

export async function requireMember(
  ctx: QueryCtx,
  sessionToken: string,
  statuses: Doc<"rooms">["status"][],
) {
  const membership = await findMembership(ctx, sessionToken);
  if (!membership) fail("INVALID_SESSION", "You are not part of this room.");
  if (isRoomExpired(membership.room, Date.now())) fail("ROOM_EXPIRED", "This room has expired.");
  if (!statuses.includes(membership.room.status)) {
    if (membership.room.status === "lobby") fail("NOT_IN_LOBBY", "The game has not started yet.");
    fail("GAME_NOT_ACTIVE", "That action is not available right now.");
  }
  return membership;
}
