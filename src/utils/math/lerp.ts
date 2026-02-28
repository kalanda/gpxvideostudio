/** Linear interpolation between a and b at t in [0, 1] */
// Overloaded to support null values
export function lerp(a: number, b: number, t: number): number;
export function lerp(
  a: number | null,
  b: number | null,
  t: number,
): number | null;
// Implementation
export function lerp(
  a: number | null,
  b: number | null,
  t: number,
): number | null {
  if (a === null || b === null) return a ?? b;
  return a + (b - a) * t;
}
