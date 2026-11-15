import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "touchgrass.pendingProof";

export type PendingProof = {
  assignmentId: string;
  uri: string;
  mediaType: "photo" | "video";
  mimeType: string;
  durationSeconds?: number;
};

async function readAll(): Promise<Record<string, PendingProof>> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Record<string, PendingProof>) : {};
}

export async function getPendingProofs(): Promise<Record<string, PendingProof>> {
  return await readAll();
}

export async function setPendingProof(proof: PendingProof) {
  const all = await readAll();
  all[proof.assignmentId] = proof;
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function removePendingProof(assignmentId: string) {
  const all = await readAll();
  delete all[assignmentId];
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function clearPendingProofs() {
  await AsyncStorage.removeItem(KEY);
}
