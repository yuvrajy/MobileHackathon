import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { MAX_PHOTO_BYTES, MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, PHOTO_MIME_TYPES, VIDEO_MIME_TYPES } from "./constants";
import type { ErrorCode } from "./errors";

export type UploadRejection = { ok: false; code: ErrorCode; message: string };

export async function isStorageAttached(ctx: MutationCtx, storageId: Id<"_storage">): Promise<boolean> {
  const submission = await ctx.db.query("submissions").withIndex("by_storage", (q) => q.eq("storageId", storageId)).first();
  if (submission) return true;
  const blooper = await ctx.db.query("bloopers").withIndex("by_storage", (q) => q.eq("storageId", storageId)).first();
  if (blooper) return true;
  const team = await ctx.db.query("teams").withIndex("by_avatar", (q) => q.eq("avatarStorageId", storageId)).first();
  return team !== null;
}

export async function rejectUpload(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
  code: ErrorCode,
  message: string,
): Promise<UploadRejection> {
  if ((await ctx.db.system.get("_storage", storageId)) && !(await isStorageAttached(ctx, storageId))) {
    await ctx.storage.delete(storageId);
  }
  return { ok: false, code, message };
}

export function checkCapturedMedia(
  meta: { contentType?: string; size: number },
  mediaType: "photo" | "video",
  mimeType: string,
  durationSeconds: number | undefined,
): { contentType: string } | { code: ErrorCode; message: string } {
  const allowed = mediaType === "photo" ? PHOTO_MIME_TYPES : VIDEO_MIME_TYPES;
  const contentType = meta.contentType ?? mimeType;
  if (!allowed.includes(contentType)) return { code: "INVALID_MEDIA", message: "That file type isn't supported." };
  const maxBytes = mediaType === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
  if (meta.size > maxBytes) return { code: "MEDIA_TOO_LARGE", message: "That file is too large. Retake a shorter clip." };
  if (mediaType === "video" && (durationSeconds === undefined || durationSeconds > MAX_VIDEO_SECONDS + 1)) {
    return { code: "VIDEO_TOO_LONG", message: `Videos can be at most ${MAX_VIDEO_SECONDS} seconds.` };
  }
  return { contentType };
}
