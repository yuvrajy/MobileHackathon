import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from "../constants";

export function normalizeRoomCode(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

export function isWellFormedRoomCode(code: string): boolean {
  return new RegExp(`^[A-Z0-9]{${ROOM_CODE_LENGTH}}$`).test(code);
}

export function generateRoomCode(random: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}
