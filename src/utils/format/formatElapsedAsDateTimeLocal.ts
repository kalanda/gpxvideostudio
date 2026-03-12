import { formatDateLocal } from "@/utils/format/formatDateLocal";
import { formatTimeLocal } from "@/utils/format/formatTimeLocal";

/**
 * Format elapsed seconds from a start time as local date + time (e.g. "15 Jul 2024 10:30:45").
 * Useful for GPX trim labels where elapsed is relative to track start.
 */
export function formatElapsedAsDateTimeLocal(
  elapsedSeconds: number,
  startTime: Date,
): string {
  const date = new Date(startTime.getTime() + elapsedSeconds * 1000);
  return `${formatDateLocal(date)} ${formatTimeLocal(date)}`;
}
