import type { Feature, Point } from "geojson";
import { SLOPE_WINDOW_HALF_M } from "@/constants/config";
import type { TelemetryPoint } from "@/types/telemetry";

/**
 * Recompute slope for each feature using a centered difference over pre-smoothed
 * elevation values, reducing GPS altitude noise in the displayed slope.
 *
 * Mutates `features[i].properties.slope` in place.
 *
 * @param features     - Telemetry features sorted by ascending cumulative distance.
 * @param smoothedEle  - Pre-smoothed elevation array (1-to-1 with features), e.g. from `smoothElevations`.
 * @param halfWindowM  - Half-window size in metres (default 60 m → 120 m total).
 */
export function smoothSlopes(
  features: Feature<Point, TelemetryPoint>[],
  smoothedEle: (number | null)[],
  halfWindowM = SLOPE_WINDOW_HALF_M,
): void {
  for (let i = 0; i < features.length; i++) {
    const curDist = features[i].properties.distance;

    let loIdx = i;
    while (
      loIdx > 0 &&
      curDist - features[loIdx - 1].properties.distance <= halfWindowM
    ) {
      loIdx--;
    }

    let hiIdx = i;
    while (
      hiIdx < features.length - 1 &&
      features[hiIdx + 1].properties.distance - curDist <= halfWindowM
    ) {
      hiIdx++;
    }

    const loEle = smoothedEle[loIdx];
    const hiEle = smoothedEle[hiIdx];
    const distDelta =
      features[hiIdx].properties.distance - features[loIdx].properties.distance;

    features[i].properties.slope =
      distDelta > 0 && loEle !== null && hiEle !== null
        ? ((hiEle - loEle) / distDelta) * 100
        : 0;
  }
}
