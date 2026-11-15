import { ConvexError } from "convex/values";

export type ErrorCode =
  | "INVALID_SESSION"
  | "ROOM_NOT_FOUND"
  | "ROOM_FULL"
  | "ROOM_STARTED"
  | "ROOM_EXPIRED"
  | "NAME_REQUIRED"
  | "NAME_TAKEN"
  | "NOT_HOST"
  | "NOT_IN_LOBBY"
  | "NOT_ENOUGH_TEAMS"
  | "NOT_ENOUGH_CHALLENGES"
  | "GAME_NOT_ACTIVE"
  | "DEADLINE_PASSED"
  | "ASSIGNMENT_NOT_FOUND"
  | "ALREADY_SUBMITTED"
  | "INVALID_MEDIA"
  | "MEDIA_TOO_LARGE"
  | "VIDEO_TOO_LONG"
  | "INVALID_PUNISHMENT"
  | "TEST_ROOMS_DISABLED"
  | "SESSION_IN_OTHER_ROOM"
  | "BLOOPER_LIMIT";

export function fail(code: ErrorCode, message: string): never {
  throw new ConvexError({ code, message });
}
