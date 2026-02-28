import { featureCollection, point } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import type {
  TelemetryFeatureCollection,
  TelemetryPoint,
} from "@/types/telemetry";

/**
 * Apply a simple moving average to smooth speed values.
 * This reduces noise from GPS inaccuracy.
 *
 * @param points Telemetry points (mutated in place for performance)
 * @param windowSize Number of points to average (must be odd, default 5)
 */
export function smoothSpeeds(
  points: TelemetryFeatureCollection,
  windowSize = 5,
): TelemetryFeatureCollection {
  if (points.features.length < windowSize) {
    return points;
  }

  const half = Math.floor(windowSize / 2);
  const smoothed = points.features.map(
    (p: Feature<Point, TelemetryPoint>): number => p.properties.speed,
  );

  for (let i = half; i < points.features.length - half; i++) {
    let sum = 0;
    for (let j = i - half; j <= i + half; j++) {
      sum += points.features[j].properties.speed;
    }
    smoothed[i] = sum / windowSize;
  }

  const smoothedPoints = points.features.map(
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

  return featureCollection<Point, TelemetryPoint>(smoothedPoints);
}
