import type {
  TelemetryFeatureCollection,
  TelemetryFrameFeature,
} from "@/types/telemetry";
import { interpolateAtTime } from "@/utils/interpolation/interpolateAtTime";

/**
 * Get the interpolated telemetry for a single frame as a GeoJSON Feature.
 * Position in geometry, telemetry in properties. Useful for Remotion's useCurrentFrame() hook.
 *
 * @param points Calculated telemetry points
 * @param frame Current frame number
 * @param fps Frames per second
 * @param gpxElapsedAtExportStart GPX elapsed time (seconds) that corresponds to export frame 0.
 *   Derived from sync offset + video trim start; independent of the GPX trim settings.
 */
export function getFrameData(
  points: TelemetryFeatureCollection | null,
  frame: number,
  fps: number,
  gpxElapsedAtExportStart = 0,
): TelemetryFrameFeature | null {
  if (!points || points.features.length < 2) {
    return null;
  }

  const totalDuration =
    points.features[points.features.length - 1].properties.elapsed;

  const elapsed = gpxElapsedAtExportStart + frame / fps;

  return interpolateAtTime(points, elapsed, frame, totalDuration);
}
