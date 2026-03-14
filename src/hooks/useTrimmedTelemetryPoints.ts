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
 * Trim is applied in one place here; MiniMap, ElevationChart and summary all use this.
 * getFrameData still uses full points + gpxTrimStartSeconds for frame→elapsed mapping.
 */
export function useTrimmedTelemetryPoints(): TelemetryFeatureCollection | null {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const gpxTrimStartSeconds = useTelemetryStore((s) => s.gpxTrimStartSeconds);
  const { effectiveDurationSeconds } = useEffectiveExportDuration();

  if (!telemetryPoints || telemetryPoints.features.length === 0) return null;

  const start = gpxTrimStartSeconds;
  const end = gpxTrimStartSeconds + effectiveDurationSeconds;

  const features = telemetryPoints.features.filter((f) => {
    const e = f.properties.elapsed;
    return e >= start && e <= end;
  });

  return featureCollection<Point, TelemetryPoint>(features);
}
