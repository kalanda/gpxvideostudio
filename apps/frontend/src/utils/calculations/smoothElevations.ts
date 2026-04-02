import { ELEVATION_SMOOTH_HALF_M } from "@kalanda/gpxvideostudio-app-frontend/src/constants/config";
import type { Feature, Point } from "geojson";
import type { TelemetryPoint } from "@/types/telemetry";

/**
 * Compute a distance-weighted moving-average of elevation values.
 *
 * For each feature the function averages the raw elevation of all neighbours
 * whose cumulative distance falls within `halfWindowM` metres on either side.
 * Expanding outward and stopping at the window boundary keeps the algorithm
 * O(n × avg_points_in_window) rather than O(n²).
 *
 * The returned array is 1-to-1 with `features`. A null is preserved when no
 * valid elevation exists in the window.
 *
 * @param features - Telemetry features sorted by ascending cumulative distance.
 * @param halfWindowM - Half-window size in metres (default 30 m → 60 m total).
 */
export function smoothElevations(
  features: Feature<Point, TelemetryPoint>[],
  halfWindowM = ELEVATION_SMOOTH_HALF_M,
): (number | null)[] {
  return features.map((f, i) => {
    const curDist = f.properties.distance;
    let sum = 0;
    let count = 0;

    for (let j = i; j >= 0; j--) {
      if (curDist - features[j].properties.distance > halfWindowM) break;
      const e = features[j].properties.elevation;
      if (e !== null) {
        sum += e;
        count++;
      }
    }

    for (let j = i + 1; j < features.length; j++) {
      if (features[j].properties.distance - curDist > halfWindowM) break;
      const e = features[j].properties.elevation;
      if (e !== null) {
        sum += e;
        count++;
      }
    }

    return count > 0 ? sum / count : f.properties.elevation;
  });
}
