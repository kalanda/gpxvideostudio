import type { Feature, Point } from "geojson";
import type { TelemetryFeatureCollection, TelemetryPoint } from "@/types/telemetry";

export type AbsoluteTime = {
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Finds the telemetry feature whose absolute timestamp best matches the given
 * time-of-day (HH:MM:SS). Ignores the date part so it works even when the
 * user only knows the clock time. When multiple points share the same delta
 * (e.g. sparse tracks), the first match is returned.
 *
 * Returns null when the collection has no features.
 */
export function findTelemetryPointByAbsoluteTime(
  telemetry: TelemetryFeatureCollection,
  time: AbsoluteTime,
): Feature<Point, TelemetryPoint> | null {
  const { features } = telemetry;
  if (features.length === 0) return null;

  const targetSecondsOfDay =
    time.hours * 3600 + time.minutes * 60 + time.seconds;

  let best = features[0];
  let bestDelta = Infinity;

  for (const feature of features) {
    const t = feature.properties.time;
    const secondsOfDay =
      t.getHours() * 3600 + t.getMinutes() * 60 + t.getSeconds();
    const delta = Math.abs(secondsOfDay - targetSecondsOfDay);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = feature;
    }
  }

  return best;
}
