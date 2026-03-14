import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { computeEffectiveExportDuration } from "@/utils/calculations/computeEffectiveExportDuration";

/**
 * Effective export duration = common span of both tracks.
 * Export is always the intersection: never longer than the GPX segment nor than the video segment.
 */
export function useEffectiveExportDuration(): {
  gpxDurationSeconds: number;
  effectiveDurationSeconds: number;
  durationInFrames: number;
  videoDurationSeconds: number | null;
} {
  const fps = useProjectVideoSettingsStore((s) => s.fps);
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const {
    backgroundVideoDurationSeconds: videoDurationSeconds,
    videoTrimStartSeconds,
    videoTrimEndSeconds,
  } = useBackgroundVideoStore();
  const { gpxTrimStartSeconds, gpxTrimEndSeconds } = useTelemetryStore();

  const gpxDurationSeconds = telemetryPoints
    ? telemetryPoints.features[telemetryPoints.features.length - 1].properties
        .elapsed
    : 0;

  const { effectiveDurationSeconds, durationInFrames } =
    computeEffectiveExportDuration({
      gpxDurationSeconds,
      gpxTrimStartSeconds,
      gpxTrimEndSeconds,
      videoDurationSeconds,
      videoTrimStartSeconds,
      videoTrimEndSeconds,
      fps,
    });

  return {
    gpxDurationSeconds,
    effectiveDurationSeconds,
    durationInFrames,
    videoDurationSeconds: videoDurationSeconds ?? null,
  };
}
