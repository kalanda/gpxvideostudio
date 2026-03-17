import { point } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import { SPEED_SMOOTHING_FACTOR } from "@/constants/config";
import type { TelemetryPoint } from "@/types/telemetry";

/**
 * Apply a simple moving average to smooth speed values.
 * This reduces noise from GPS inaccuracy.
 *
 * @param points Telemetry points (mutated in place for performance)
 * @param windowSize Number of points to average (must be odd, default 5)
 */
export function smoothSpeeds(
  points: Feature<Point, TelemetryPoint>[],
  windowSize = SPEED_SMOOTHING_FACTOR,
): Feature<Point, TelemetryPoint>[] {
  if (points.length < windowSize) {
    return points;
  }

  const half = Math.floor(windowSize / 2);
  const smoothed = points.map(
    (p: Feature<Point, TelemetryPoint>): number => p.properties.speed,
  );

  for (let i = half; i < points.length - half; i++) {
    let sum = 0;
    for (let j = i - half; j <= i + half; j++) {
      sum += points[j].properties.speed;
    }
    smoothed[i] = sum / windowSize;
  }

  const smoothedPoints = points.map(
    (p: Feature<Point, TelemetryPoint>, i: number) => {
      return point<TelemetryPoint>(
        [p.geometry.coordinates[0], p.geometry.coordinates[1]],
        {
          ...p.properties,
          speed: smoothed[i],
        },
      );
    },
  );

  return smoothedPoints;
}
