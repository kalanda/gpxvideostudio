import type {
  TelemetryFeatureCollection,
  TelemetryFrameFeature,
} from "@/types/telemetry";
import { interpolateAtTime } from "./interpolateAtTime";

/**
 * Get the interpolated telemetry for a single frame as a GeoJSON Feature.
 * Position in geometry, telemetry in properties. Useful for Remotion's useCurrentFrame() hook.
 *
 * @param points Calculated telemetry points
 * @param frame Current frame number
 * @param fps Frames per second
 * @param gpxTrimStartSeconds Trim: GPX elapsed time at which the export starts (export second 0 = this time in the track).
 */
export function getFrameData(
  points: TelemetryFeatureCollection | null,
  frame: number,
  fps: number,
  gpxTrimStartSeconds = 0,
): TelemetryFrameFeature | null {
  if (!points || points.features.length < 2) {
    return null;
  }

  const totalDuration =
    points.features[points.features.length - 1].properties.elapsed;

  const elapsed = gpxTrimStartSeconds + frame / fps;

  return interpolateAtTime(points, elapsed, frame, totalDuration);
}
