/**
 * Pure computation of effective export duration from sync, trim and duration inputs.
 * Used by useEffectiveExportDuration; kept separate for unit testing.
 *
 * When a sync has been performed (syncOffsetSeconds ≠ 0 or videoStartTimestamp is set),
 * the export covers the INTERSECTION of both track segments in absolute time:
 *
 *   Video segment [videoTrimStart, videoTrimEnd] converted to GPX elapsed:
 *     [syncOffset + videoTrimStart, syncOffset + videoTrimEnd]
 *   GPX segment [gpxTrimStart, gpxTrimEnd]
 *   Intersection → export range
 *
 * This means trimming either track does NOT change the sync relationship; it only
 * shrinks or shifts the exported range.
 *
 * Special case: when gpxDurationSeconds ≤ 0 (no GPX loaded), duration is driven
 * by the video segment alone and gpxElapsedAtExportStart / videoTimeAtFrame0 fall
 * back to the video trim values.
 */
export function computeEffectiveExportDuration({
  gpxDurationSeconds,
  gpxTrimStartSeconds,
  gpxTrimEndSeconds,
  syncOffsetSeconds,
  videoDurationSeconds,
  videoTrimStartSeconds,
  videoTrimEndSeconds,
  fps,
}: {
  gpxDurationSeconds: number;
  gpxTrimStartSeconds: number;
  gpxTrimEndSeconds: number;
  /** Seconds from GPX elapsed=0 to video frame t=0. From computeSyncOffset(). */
  syncOffsetSeconds: number;
  videoDurationSeconds: number | null;
  videoTrimStartSeconds: number;
  videoTrimEndSeconds: number;
  fps: number;
}): {
  effectiveDurationSeconds: number;
  durationInFrames: number;
  /** GPX elapsed time at export frame 0. */
  gpxElapsedAtExportStart: number;
  /** Video time (seconds into the raw file) at export frame 0. Used for Remotion trimBefore. */
  videoTimeAtFrame0: number;
} {
  // No GPX loaded: duration is driven by video only.
  if (gpxDurationSeconds <= 0) {
    const videoSegmentEnd =
      videoDurationSeconds != null && videoDurationSeconds > 0 && videoTrimEndSeconds > 0
        ? Math.min(videoTrimEndSeconds, videoDurationSeconds)
        : (videoDurationSeconds ?? 0);
    const effectiveDurationSeconds = Math.max(
      0,
      videoDurationSeconds != null && videoDurationSeconds > 0
        ? videoSegmentEnd - videoTrimStartSeconds
        : 0,
    );
    const durationInFrames = Math.max(1, Math.ceil(effectiveDurationSeconds * fps));
    return {
      effectiveDurationSeconds,
      durationInFrames,
      gpxElapsedAtExportStart: videoTrimStartSeconds,
      videoTimeAtFrame0: videoTrimStartSeconds,
    };
  }

  // GPX segment boundaries (in GPX elapsed seconds).
  const gpxSegmentStart = gpxTrimStartSeconds;
  const gpxSegmentEnd =
    gpxTrimEndSeconds > 0
      ? Math.min(gpxTrimEndSeconds, gpxDurationSeconds)
      : gpxDurationSeconds;

  // Video segment boundaries mapped to GPX elapsed coordinates (add syncOffset).
  const videoSegmentEnd =
    videoDurationSeconds != null && videoDurationSeconds > 0 && videoTrimEndSeconds > 0
      ? Math.min(videoTrimEndSeconds, videoDurationSeconds)
      : (videoDurationSeconds ?? Number.POSITIVE_INFINITY);
  const videoStartInGpx = syncOffsetSeconds + videoTrimStartSeconds;
  const videoEndInGpx = syncOffsetSeconds + videoSegmentEnd;

  // Export = intersection of both segments in GPX elapsed coordinates.
  const exportStartGpxElapsed = Math.max(gpxSegmentStart, videoStartInGpx);
  const exportEndGpxElapsed = Math.min(gpxSegmentEnd, videoEndInGpx);

  const effectiveDurationSeconds = Math.max(0, exportEndGpxElapsed - exportStartGpxElapsed);
  const durationInFrames = Math.max(1, Math.ceil(effectiveDurationSeconds * fps));

  // Convert export start back to video-file time.
  // This may differ from videoTrimStartSeconds when gpxTrimStart is the binding constraint.
  const videoTimeAtFrame0 = exportStartGpxElapsed - syncOffsetSeconds;

  return {
    effectiveDurationSeconds,
    durationInFrames,
    gpxElapsedAtExportStart: exportStartGpxElapsed,
    videoTimeAtFrame0,
  };
}
