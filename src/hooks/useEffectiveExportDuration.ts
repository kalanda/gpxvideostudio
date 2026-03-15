import { useShallow } from "zustand/react/shallow";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { computeEffectiveExportDuration } from "@/utils/calculations/computeEffectiveExportDuration";
import { computeSyncOffset } from "@/utils/calculations/computeSyncOffset";

/**
 * Effective export duration = intersection of the video and GPX track segments.
 *
 * Sync is read from videoStartTimestamp (independent of trims). Changing any trim
 * adjusts the duration without altering the sync relationship.
 */
export function useEffectiveExportDuration(): {
  gpxDurationSeconds: number;
  effectiveDurationSeconds: number;
  durationInFrames: number;
  videoDurationSeconds: number | null;
  /** GPX elapsed time (seconds) that corresponds to export frame 0. */
  gpxElapsedAtExportStart: number;
  /** Video time (seconds into the raw file) at export frame 0. Used for Remotion trimBefore. */
  videoTimeAtFrame0: number;
} {
  const fps = useProjectVideoSettingsStore((s) => s.fps);
  const { telemetryPoints, gpxTrimStartSeconds, gpxTrimEndSeconds } =
    useTelemetryStore(
      useShallow((s) => ({
        telemetryPoints: s.telemetryPoints,
        gpxTrimStartSeconds: s.gpxTrimStartSeconds,
        gpxTrimEndSeconds: s.gpxTrimEndSeconds,
      })),
    );
  const {
    backgroundVideoDurationSeconds: videoDurationSeconds,
    videoTrimStartSeconds,
    videoTrimEndSeconds,
    videoStartTimestamp,
  } = useBackgroundVideoStore(
    useShallow((s) => ({
      backgroundVideoDurationSeconds: s.backgroundVideoDurationSeconds,
      videoTrimStartSeconds: s.videoTrimStartSeconds,
      videoTrimEndSeconds: s.videoTrimEndSeconds,
      videoStartTimestamp: s.videoStartTimestamp,
    })),
  );

  const gpxDurationSeconds = telemetryPoints
    ? telemetryPoints.features[telemetryPoints.features.length - 1].properties
        .elapsed
    : 0;

  const gpxStartTime =
    telemetryPoints && telemetryPoints.features.length > 0
      ? telemetryPoints.features[0].properties.time
      : null;

  const syncOffsetSeconds = computeSyncOffset(videoStartTimestamp, gpxStartTime);

  const {
    effectiveDurationSeconds,
    durationInFrames,
    gpxElapsedAtExportStart,
    videoTimeAtFrame0,
  } = computeEffectiveExportDuration({
    gpxDurationSeconds,
    gpxTrimStartSeconds,
    gpxTrimEndSeconds,
    syncOffsetSeconds,
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
    gpxElapsedAtExportStart,
    videoTimeAtFrame0,
  };
}
