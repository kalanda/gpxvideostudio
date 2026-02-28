import { msToKmh } from "./msToKmh";

/** Format speed as km/h string */
export function formatSpeed(ms: number): string {
  return msToKmh(ms).toFixed(1);
}
