import { useMemo } from "react";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import type { TelemetryFeatureCollection } from "@/types/telemetry";
import { sliceTelemetryByElapsed } from "@/utils/calculations/sliceTelemetryByElapsed";
import { useEffectiveExportDuration } from "./useEffectiveExportDuration";

/**
 * Returns the telemetry points trimmed to the current export segment.
 * Trim is applied in one place here; MiniMap, ElevationChart and summary all use this.
 * getFrameData still uses full points + gpxTrimStartSeconds for frame→elapsed mapping.
 */
export function useTrimmedTelemetryPoints(): TelemetryFeatureCollection | null {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const gpxTrimStartSeconds = useBackgroundVideoStore(
    (s) => s.gpxTrimStartSeconds,
  );
  const { effectiveDurationSeconds } = useEffectiveExportDuration();

  return useMemo(() => {
    if (!telemetryPoints || telemetryPoints.features.length === 0)
      return null;

    const start = gpxTrimStartSeconds;
    const end = gpxTrimStartSeconds + effectiveDurationSeconds;

    return sliceTelemetryByElapsed(telemetryPoints, start, end);
  }, [
    telemetryPoints,
    gpxTrimStartSeconds,
    effectiveDurationSeconds,
  ]);
}
