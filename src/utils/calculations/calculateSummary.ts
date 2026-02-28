import { lineString } from "@turf/helpers";
import length from "@turf/length";
import type {
  TelemetryFeatureCollection,
  TelemetrySummary,
} from "@/types/telemetry";

/**
 * Calculate summary statistics for a set of telemetry points.
 */
export function calculateSummary(
  points: TelemetryFeatureCollection | null,
): TelemetrySummary {
  if (!points || points.features.length === 0) {
    return {
      totalDistance: 0,
      totalDuration: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      maxElevation: null,
      minElevation: null,
      elevationGain: 0,
      elevationLoss: 0,
      pointCount: 0,
    };
  }

  const line = lineString(
    points.features.map(
      (p) =>
        [p.geometry.coordinates[0], p.geometry.coordinates[1]] as [
          number,
          number,
        ],
    ),
  );
  const totalDistance = length(line, { units: "meters" });

  const last = points.features[points.features.length - 1];
  const totalDuration = last.properties.elapsed;

  let maxSpeed = 0;
  let speedSum = 0;
  let movingCount = 0;
  let maxEle: number | null = null;
  let minEle: number | null = null;
  let elevationGain = 0;
  let elevationLoss = 0;

  for (let i = 0; i < points.features.length; i++) {
    const p = points.features[i];

    if (p.properties.speed > maxSpeed) maxSpeed = p.properties.speed;

    if (p.properties.speed > 0.5) {
      speedSum += p.properties.speed;
      movingCount++;
    }

    if (p.properties.elevation !== null) {
      if (maxEle === null || p.properties.elevation > maxEle)
        maxEle = p.properties.elevation;
      if (minEle === null || p.properties.elevation < minEle)
        minEle = p.properties.elevation;

      if (i > 0 && points.features[i - 1].properties.elevation !== null) {
        const diff =
          p.properties.elevation -
          (points.features[i - 1].properties.elevation as number);
        if (diff > 0) elevationGain += diff;
        else elevationLoss += Math.abs(diff);
      }
    }
  }

  return {
    totalDistance,
    totalDuration,
    maxSpeed,
    avgSpeed: movingCount > 0 ? speedSum / movingCount : 0,
    maxElevation: maxEle,
    minElevation: minEle,
    elevationGain,
    elevationLoss,
    pointCount: points.features.length,
  };
}
