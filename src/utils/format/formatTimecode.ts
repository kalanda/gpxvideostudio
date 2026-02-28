import { secondsToHMS } from "./secondsToHMS";

/** Format frame number as SMPTE-style timecode HH:MM:SS:FF */
export function formatTimecode(frame: number, fps: number): string {
  const { h, m, s } = secondsToHMS(frame / fps);
  const f = Math.floor(frame % fps);
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const ff = String(f).padStart(2, "0");
  return `${hh}:${mm}:${ss}:${ff}`;
}
