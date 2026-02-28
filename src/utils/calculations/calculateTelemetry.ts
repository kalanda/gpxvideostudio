import bearing from "@turf/bearing";
import distance from "@turf/distance";
import { featureCollection, lineString, point } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import type { GpxTrackPoint } from "@/types/gpx";
import type {
  TelemetryFeatureCollection,
  TelemetryPoint,
} from "@/types/telemetry";

const MIN_TIME_DELTA_S = 0.5;

/** Unwrap angle so it is continuous with ref (avoids 360° jumps when crossing ±180°). */
function unwrapBearing(angle: number, ref: number): number {
  let a = angle;
  while (a - ref > 180) a -= 360;
  while (a - ref < -180) a += 360;
  return a;
}

/**
 * Calculate telemetry data for a set of GpxTrackPoint.
 * @param points - The GpxTrackPoint[] to calculate telemetry for.
 * @returns A FeatureCollection of Point features with telemetry data.
 */
export function calculateTelemetry(
  points: GpxTrackPoint[],
): TelemetryFeatureCollection {
  const timedPoints = points.filter(
    (p): p is GpxTrackPoint & { time: Date } => p.time !== null,
  );

  if (timedPoints.length === 0) {
    return featureCollection<Point, TelemetryPoint>([]);
  }

  const line = lineString(
    timedPoints.map((p) => [p.lon, p.lat] as [number, number]),
  );
  const coords = line.geometry.coordinates;

  const startTime = timedPoints[0].time.getTime();

  let cumulativeDistance = 0;
  let prevUnwrappedBearing: number | null = null;

  const featuresWithTelemetry: Feature<Point, TelemetryPoint>[] = [];
  for (let i = 0; i < timedPoints.length; i++) {
    const current = timedPoints[i];
    const prev = i > 0 ? timedPoints[i - 1] : null;

    let segmentDistance = 0;
    let speed = 0;
    let slope = 0;
    let bearingDeg = 0;

    if (prev) {
      bearingDeg = bearing(
        point(coords[i - 1]),
        point(coords[i]),
      );
      segmentDistance = distance(point(coords[i - 1]), point(coords[i]), {
        units: "meters",
      });
      cumulativeDistance += segmentDistance;

      const timeDelta = (current.time.getTime() - prev.time.getTime()) / 1000;

      if (timeDelta >= MIN_TIME_DELTA_S && segmentDistance > 0) {
        speed = segmentDistance / timeDelta;
      }

      if (segmentDistance > 0 && current.ele !== null && prev.ele !== null) {
        const elevationDelta = current.ele - prev.ele;
        slope = (elevationDelta / segmentDistance) * 100;
      }
    } else if (i < timedPoints.length - 1) {
      bearingDeg = bearing(point(coords[i]), point(coords[i + 1]));
    }

    if (prevUnwrappedBearing !== null) {
      bearingDeg = unwrapBearing(bearingDeg, prevUnwrappedBearing);
    }
    prevUnwrappedBearing = bearingDeg;

    featuresWithTelemetry.push(
      point<TelemetryPoint>([current.lon, current.lat], {
        index: i,
        elevation: current.ele,
        time: current.time,
        speed,
        distance: cumulativeDistance,
        slope,
        elapsed: (current.time.getTime() - startTime) / 1000,
        bearing: bearingDeg,
        hr: current.hr,
        cad: current.cad,
        power: current.power,
        temp: current.temp,
      } as TelemetryPoint),
    );
  }

  return featureCollection<Point, TelemetryPoint>(featuresWithTelemetry);
}
