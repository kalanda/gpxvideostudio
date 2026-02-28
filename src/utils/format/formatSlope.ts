/** Format slope as percentage */
export function formatSlope(slope: number): string {
  return `${slope >= 0 ? "+" : ""}${slope.toFixed(1)}`;
}
