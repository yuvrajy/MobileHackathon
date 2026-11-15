import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import type { ErrorCode } from "./errors";

export type UploadRejection = { ok: false; code: ErrorCode; message: string };

export async function isStorageAttached(ctx: MutationCtx, storageId: Id<"_storage">): Promise<boolean> {
  const submission = await ctx.db.query("submissions").withIndex("by_storage", (q) => q.eq("storageId", storageId)).first();
  if (submission) return true;
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
