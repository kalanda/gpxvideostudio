import { secondsToHMS } from "@/utils/format/secondsToHMS";

/** Format elapsed seconds as HH:MM:SS (always 3 segments with leading zeros) */
export function formatPlaybackTime(seconds: number): string {
  const { h, m, s } = secondsToHMS(Math.max(0, Math.floor(seconds)));
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
