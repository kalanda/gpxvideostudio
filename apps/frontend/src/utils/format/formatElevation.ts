/** Format elevation in meters */
export function formatElevation(meters: number | null): string {
  if (meters === null) return "--";
  return `${Math.round(meters)}`;
}
