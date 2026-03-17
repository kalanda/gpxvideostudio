/** Format temperature in degrees Celsius, rounded to one decimal place. */
export function formatTemperature(celsius: number | null): string {
  if (celsius === null) return "--";
  return celsius.toFixed(1);
}
