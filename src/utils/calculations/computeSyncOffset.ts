/**
 * Compute the sync offset in seconds between the start of the video file (frame t=0)
 * and the start of the GPX track (first point, elapsed=0).
 *
 * A positive value means the video starts AFTER the GPX track begins.
 * A negative value means the video starts BEFORE the GPX track begins.
 *
 * Returns 0 when either timestamp is null (no sync performed yet).
 */
export function computeSyncOffset(
  videoStartTimestamp: Date | null,
  gpxStartTime: Date | null,
): number {
  if (!videoStartTimestamp || !gpxStartTime) return 0;
  return (videoStartTimestamp.getTime() - gpxStartTime.getTime()) / 1000;
}
