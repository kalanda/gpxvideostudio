import { format } from "date-fns";

/**
 * Format a Date as local time string (e.g. "10:30:45").
 * Uses the browser's timezone.
 */
export function formatTimeLocal(date: Date): string {
  return format(date, "HH:mm:ss");
}
