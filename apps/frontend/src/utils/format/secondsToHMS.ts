/** Split total seconds into hours, minutes, seconds (integer parts) */
export function secondsToHMS(seconds: number): {
  h: number;
  m: number;
  s: number;
} {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { h, m, s };
}
