/**
 * Pure computation of effective export duration from trim and duration inputs.
 * Used by useEffectiveExportDuration; kept separate for unit testing.
 */
export function computeEffectiveExportDuration({
  gpxDurationSeconds,
  gpxTrimStartSeconds,
  gpxTrimEndSeconds,
  videoDurationSeconds,
  videoTrimStartSeconds,
  videoTrimEndSeconds,
  fps,
}: {
  gpxDurationSeconds: number;
  gpxTrimStartSeconds: number;
  gpxTrimEndSeconds: number;
  videoDurationSeconds: number | null;
  videoTrimStartSeconds: number;
  videoTrimEndSeconds: number;
  fps: number;
}): { effectiveDurationSeconds: number; durationInFrames: number } {
  const gpxSegmentEnd =
    gpxTrimEndSeconds > 0
      ? Math.min(gpxTrimEndSeconds, gpxDurationSeconds)
      : gpxDurationSeconds;
  const maxFromGpx = Math.max(0, gpxSegmentEnd - gpxTrimStartSeconds);

  const videoSegmentEnd =
    videoDurationSeconds != null &&
    videoDurationSeconds > 0 &&
    videoTrimEndSeconds > 0
      ? Math.min(videoTrimEndSeconds, videoDurationSeconds)
      : videoDurationSeconds ?? 0;
  const maxFromVideo =
    videoDurationSeconds != null && videoDurationSeconds > 0
      ? Math.max(0, videoSegmentEnd - videoTrimStartSeconds)
      : Number.POSITIVE_INFINITY;

  const effectiveDurationSeconds = Math.min(maxFromGpx, maxFromVideo);
  const durationInFrames = Math.max(
    1,
    Math.ceil(effectiveDurationSeconds * fps),
  );

  return { effectiveDurationSeconds, durationInFrames };
}
