import { format } from "date-fns";

/**
 * Format a Date as local date string (e.g. "15 Jul 2024").
 * Uses the browser's timezone.
 */
export function formatDateLocal(date: Date): string {
  return format(date, "d MMM yyyy");
}
