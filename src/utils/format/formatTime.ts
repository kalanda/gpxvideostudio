import { secondsToHMS } from "./secondsToHMS";

/** Format elapsed seconds as HH:MM:SS or MM:SS */
export function formatTime(seconds: number): string {
  const { h, m, s } = secondsToHMS(seconds);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${h}h ${mm}m ${ss}s`;
}
