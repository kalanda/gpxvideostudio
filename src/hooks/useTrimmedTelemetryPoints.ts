import { featureCollection } from "@turf/helpers";
import type { Point } from "geojson";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useTelemetryStore } from "@/stores/telemetryStore";
import type {
  TelemetryFeatureCollection,
  TelemetryPoint,
} from "@/types/telemetry";

/**
 * Returns the telemetry points trimmed to the current export segment.
 * The segment boundaries come from gpxElapsedAtExportStart (sync + video trim)
 * and effectiveDurationSeconds. MiniMap, ElevationChart and summary all use this.
 * getFrameData still uses full points + gpxElapsedAtExportStart for frame→elapsed mapping.
 */
export function useTrimmedTelemetryPoints(): TelemetryFeatureCollection | null {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const { effectiveDurationSeconds, gpxElapsedAtExportStart } =
    useEffectiveExportDuration();

  if (!telemetryPoints || telemetryPoints.features.length === 0) return null;

  const start = gpxElapsedAtExportStart;
  const end = gpxElapsedAtExportStart + effectiveDurationSeconds;

  const features = telemetryPoints.features.filter((f) => {
    const e = f.properties.elapsed;
    return e >= start && e <= end;
  });

  return featureCollection<Point, TelemetryPoint>(features);
}
