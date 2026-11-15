import { useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { errorMessage } from "./errors";
import { deleteLocalFile, uploadToConvex } from "./media";
import { removePendingProof, setPendingProof, type PendingProof } from "./pendingProof";

export type SubmitOutcome = { ok: true } | { ok: false; message: string; retryable: boolean };

export function useSubmitProof(sessionToken: string | null) {
  const generateUrl = useMutation(api.game.generateProofUploadUrl);
  const submit = useMutation(api.game.submitEvidence);

  return useCallback(
    async (proof: PendingProof): Promise<SubmitOutcome> => {
      if (!sessionToken) return { ok: false, message: "Your session is missing.", retryable: false };
      const assignmentId = proof.assignmentId as Id<"assignments">;
      await setPendingProof(proof);
      try {
        const uploadUrl = await generateUrl({ sessionToken, assignmentId });
        const storageId = await uploadToConvex(uploadUrl, proof.uri, proof.mimeType);
        const result = await submit({
          sessionToken,
          assignmentId,
          storageId: storageId as Id<"_storage">,
          mediaType: proof.mediaType,
          mimeType: proof.mimeType,
          durationSeconds: proof.durationSeconds,
        });
        if (!result.ok) {
          const retryable = result.code === "INVALID_MEDIA" && /didn't arrive/.test(result.message);
          if (!retryable) {
            await removePendingProof(proof.assignmentId);
            deleteLocalFile(proof.uri);
          }
          return { ok: false, message: result.message, retryable };
        }
        await removePendingProof(proof.assignmentId);
        deleteLocalFile(proof.uri);
        return { ok: true };
      } catch (error) {
        const message = errorMessage(error);
        const final = /already complete|isn't yours|Time is up|expired|isn't running/.test(message);
        if (final) {
          await removePendingProof(proof.assignmentId);
          deleteLocalFile(proof.uri);
        }
        return { ok: false, message, retryable: !final };
      }
    },
    [sessionToken, generateUrl, submit],
  );
}
