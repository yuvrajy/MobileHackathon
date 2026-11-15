import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function useServerClockOffset(): number {
  const serverNow = useMutation(api.game.serverNow);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const sentAt = Date.now();
    serverNow({})
      .then((server) => {
        const receivedAt = Date.now();
        setOffset(server - (sentAt + receivedAt) / 2);
      })
      .catch(() => {});
  }, [serverNow]);
  return offset;
}

export function useRemainingMs(endsAt: number | undefined): number {
  const offset = useServerClockOffset();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return endsAt === undefined ? 0 : Math.max(0, endsAt - (now + offset));
}
