import { Directory, File, Paths } from "expo-file-system";
import { Asset, requestPermissionsAsync } from "expo-media-library";

export type UploadedFile = { storageId: string };

export async function uploadToConvex(uploadUrl: string, localUri: string, mimeType: string): Promise<string> {
  const result = await new File(localUri).upload(uploadUrl, {
    httpMethod: "POST",
    headers: { "Content-Type": mimeType },
    mimeType,
  });
  if (result.status < 200 || result.status >= 300) throw new Error(`Upload failed with status ${result.status}`);
  const { storageId } = JSON.parse(result.body) as UploadedFile;
  if (!storageId) throw new Error("Upload response missing storageId");
  return storageId;
}

export function mimeTypeForUri(uri: string, kind: "photo" | "video"): string {
  const lower = uri.toLowerCase();
  if (kind === "video") return lower.endsWith(".mp4") ? "video/mp4" : "video/quicktime";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".heic")) return "image/heic";
  return "image/jpeg";
}

export class PermissionDeniedError extends Error {}

async function ensureLibraryPermission() {
  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) throw new PermissionDeniedError("Photo library permission is needed to save.");
}

export async function saveRemoteFileToLibrary(url: string, extension: string): Promise<void> {
  await ensureLibraryPermission();
  const directory = new Directory(Paths.cache, "downloads");
  if (!directory.exists) directory.create({ intermediates: true });
  const target = new File(directory, `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);
  const file = await File.downloadFileAsync(url, target);
  try {
    await Asset.create(file.uri);
  } finally {
    if (file.exists) file.delete();
  }
}

export function persistCapture(tempUri: string): string {
  const directory = new Directory(Paths.document, "pending-proof");
  if (!directory.exists) directory.create({ intermediates: true });
  const source = new File(tempUri);
  const target = new File(directory, `${Date.now()}-${source.name}`);
  source.copy(target);
  return target.uri;
}

export function deleteLocalFile(uri: string) {
  const file = new File(uri);
  if (file.exists) file.delete();
}
