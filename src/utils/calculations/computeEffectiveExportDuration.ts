/**
 * Pure computation of effective export duration from sync and video trim inputs.
 * Used by useEffectiveExportDuration; kept separate for unit testing.
 *
 * The export segment is determined solely by the video trim, mapped to GPX
 * elapsed coordinates via the sync offset. The GPX track is used in full;
 * trimming is done on the video side only.
 *
 * When a sync has been performed (syncOffsetSeconds ≠ 0 or videoStartTimestamp is set),
 * the export covers the video segment [videoTrimStart, videoTrimEnd] mapped to GPX elapsed:
 *   [syncOffset + videoTrimStart, syncOffset + videoTrimEnd]
 * Intersected with the full GPX track [0, gpxDurationSeconds] to cap when video
 * extends beyond the track.
 *
 * Special case: when gpxDurationSeconds ≤ 0 (no GPX loaded), duration is driven
 * by the video segment alone and gpxElapsedAtExportStart / videoTimeAtFrame0 fall
 * back to the video trim values.
 */
export function computeEffectiveExportDuration({
  gpxDurationSeconds,
  syncOffsetSeconds,
  videoDurationSeconds,
  videoTrimStartSeconds,
  videoTrimEndSeconds,
  fps,
}: {
  gpxDurationSeconds: number;
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
      videoDurationSeconds != null &&
      videoDurationSeconds > 0 &&
      videoTrimEndSeconds > 0
        ? Math.min(videoTrimEndSeconds, videoDurationSeconds)
        : (videoDurationSeconds ?? 0);
    const effectiveDurationSeconds = Math.max(
      0,
      videoDurationSeconds != null && videoDurationSeconds > 0
        ? videoSegmentEnd - videoTrimStartSeconds
        : 0,
    );
    const durationInFrames = Math.max(
      1,
      Math.ceil(effectiveDurationSeconds * fps),
    );
    return {
      effectiveDurationSeconds,
      durationInFrames,
      gpxElapsedAtExportStart: videoTrimStartSeconds,
      videoTimeAtFrame0: videoTrimStartSeconds,
    };
  }

  // Full GPX track segment (no GPX trim — video trim determines the export).
  const gpxSegmentStart = 0;
  const gpxSegmentEnd = gpxDurationSeconds;

  // Video segment boundaries mapped to GPX elapsed coordinates (add syncOffset).
  const videoSegmentEnd =
    videoDurationSeconds != null &&
    videoDurationSeconds > 0 &&
    videoTrimEndSeconds > 0
      ? Math.min(videoTrimEndSeconds, videoDurationSeconds)
      : (videoDurationSeconds ?? Number.POSITIVE_INFINITY);
  const videoStartInGpx = syncOffsetSeconds + videoTrimStartSeconds;
  const videoEndInGpx = syncOffsetSeconds + videoSegmentEnd;

  // Export = intersection of video segment (in GPX coords) with full GPX track.
  const exportStartGpxElapsed = Math.max(gpxSegmentStart, videoStartInGpx);
  const exportEndGpxElapsed = Math.min(gpxSegmentEnd, videoEndInGpx);

  const effectiveDurationSeconds = Math.max(
    0,
    exportEndGpxElapsed - exportStartGpxElapsed,
  );
  const durationInFrames = Math.max(
    1,
    Math.ceil(effectiveDurationSeconds * fps),
  );

  const videoTimeAtFrame0 = exportStartGpxElapsed - syncOffsetSeconds;

  return {
    effectiveDurationSeconds,
    durationInFrames,
    gpxElapsedAtExportStart: exportStartGpxElapsed,
    videoTimeAtFrame0,
  };
}
