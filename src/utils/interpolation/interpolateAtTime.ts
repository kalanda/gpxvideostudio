import bearing from "@turf/bearing";
import { point } from "@turf/helpers";
import type {
  TelemetryFeatureCollection,
  TelemetryFrame,
  TelemetryFrameFeature,
} from "@/types/telemetry";
import { lerp } from "@/utils/math/lerp";

/** Unwrap angle so it is continuous with ref (avoids 360° jumps when crossing ±180°). */
function unwrapBearing(angle: number, ref: number): number {
  let a = angle;
  while (a - ref > 180) a -= 360;
  while (a - ref < -180) a += 360;
  return a;
}

function findPointIndex(
  points: TelemetryFeatureCollection,
  elapsed: number,
): number {
  let low = 0;
  let high = points.features.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (points.features[mid].properties.elapsed <= elapsed) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

/**
 * Interpolate telemetry at a specific elapsed time; returns a GeoJSON Feature
 * with geometry for position and properties for telemetry (no coordinates in properties).
 */
export function interpolateAtTime(
  points: TelemetryFeatureCollection,
  elapsed: number,
  frame: number,
  totalDuration: number,
): TelemetryFrameFeature {
  const idx = findPointIndex(points, elapsed);
  const p1 = points.features[idx];

  if (idx >= points.features.length - 1) {
    const last = points.features[points.features.length - 1];
    const properties: TelemetryFrame = {
      index: last.properties.index,
      frame,
      time: last.properties.time,
      elapsed: last.properties.elapsed,
      elevation: last.properties.elevation,
      speed: last.properties.speed,
      distance: last.properties.distance,
      slope: last.properties.slope,
      bearing: last.properties.bearing,
      hr: last.properties.hr,
      cad: last.properties.cad,
      power: last.properties.power,
      temp: last.properties.temp,
      progress: 1,
    };
    return {
      type: "Feature",
      geometry: last.geometry,
      properties,
    };
  }

  const p2 = points.features[idx + 1];
  const segmentDuration = p2.properties.elapsed - p1.properties.elapsed;
  const t =
    segmentDuration > 0
      ? (elapsed - p1.properties.elapsed) / segmentDuration
      : 0;

  const interpolatedTime = new Date(
    lerp(p1.properties.time.getTime(), p2.properties.time.getTime(), t),
  );

  const [lon1, lat1] = p1.geometry.coordinates;
  const [lon2, lat2] = p2.geometry.coordinates;
  const segmentBearingRaw = bearing(
    point(p1.geometry.coordinates),
    point(p2.geometry.coordinates),
  );
  const segmentBearing =
    idx > 0
      ? unwrapBearing(
          segmentBearingRaw,
          bearing(
            point(points.features[idx - 1].geometry.coordinates),
            point(p1.geometry.coordinates),
          ),
        )
      : segmentBearingRaw;

  const properties: TelemetryFrame = {
    index: p1.properties.index,
    frame,
    time: interpolatedTime,
    elapsed,
    elevation: lerp(p1.properties.elevation, p2.properties.elevation, t),
    speed: lerp(p1.properties.speed, p2.properties.speed, t),
    distance: lerp(p1.properties.distance, p2.properties.distance, t),
    slope: lerp(p1.properties.slope, p2.properties.slope, t),
    bearing: segmentBearing,
    hr: lerp(p1.properties.hr, p2.properties.hr, t),
    cad: lerp(p1.properties.cad, p2.properties.cad, t),
    power: lerp(p1.properties.power, p2.properties.power, t),
    temp: lerp(p1.properties.temp, p2.properties.temp, t),
    progress: totalDuration > 0 ? elapsed / totalDuration : 0,
  };

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lerp(lon1, lon2, t), lerp(lat1, lat2, t)],
    },
    properties,
  };
}
