import { featureCollection } from "@turf/helpers";
import type { Point } from "geojson";
import type {
  TelemetryFeatureCollection,
  TelemetryPoint,
} from "@/types/telemetry";

/**
 * Slice a telemetry collection to the segment between start and end elapsed time (seconds).
 * Only features with elapsed in [startElapsedSeconds, endElapsedSeconds] are included.
 * This is the single place where "trim" is applied to the route for display/export.
 */
export function sliceTelemetryByElapsed(
  points: TelemetryFeatureCollection,
  startElapsedSeconds: number,
  endElapsedSeconds: number,
): TelemetryFeatureCollection {
  const features = points.features.filter((f) => {
    const e = f.properties.elapsed;
    return e >= startElapsedSeconds && e <= endElapsedSeconds;
  });

  return featureCollection<Point, TelemetryPoint>(features);
}
