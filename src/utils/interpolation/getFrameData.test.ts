import { describe, expect, test } from "vitest";
import { featureCollection, point } from "@turf/helpers";
import type { Point } from "geojson";
import type {
  TelemetryFeatureCollection,
  TelemetryPoint,
} from "@/types/telemetry";
import { getFrameData } from "./getFrameData";

function makePoints(count: number): TelemetryFeatureCollection {
  const base = new Date("2024-01-01T10:00:00Z").getTime();
  const features = Array.from({ length: count }, (_, i) =>
    point([i, i], {
      index: i,
      elevation: 100 + i,
      time: new Date(base + i * 10_000),
      speed: 5,
      distance: i * 50,
      slope: 0,
      elapsed: i * 10,
      bearing: 0,
      hr: null,
      cad: null,
      power: null,
      temp: null,
    } as TelemetryPoint),
  );
  return featureCollection<Point, TelemetryPoint>(features);
}

describe("getFrameData", () => {
  test("returns null when points has fewer than 2 features", () => {
    expect(getFrameData(makePoints(0), 0, 30)).toBeNull();
    expect(getFrameData(makePoints(1), 0, 30)).toBeNull();
  });

  test("returns Feature for frame 0 at 30 fps", () => {
    const points = makePoints(3);
    const result = getFrameData(points, 0, 30);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("Feature");
    expect(result?.properties.frame).toBe(0);
    expect(result?.properties.elapsed).toBe(0);
  });

  test("returns Feature with correct frame and elapsed from fps", () => {
    const points = makePoints(3);
    const fps = 10;
    const result = getFrameData(points, 10, fps);
    expect(result).not.toBeNull();
    expect(result?.properties.frame).toBe(10);
    expect(result?.properties.elapsed).toBe(1);
  });

  test("returns last point when frame is at end of track", () => {
    const points = makePoints(3);
    const fps = 10;
    const lastElapsed =
      points.features[points.features.length - 1].properties.elapsed;
    const frame = Math.ceil(lastElapsed * fps);
    const result = getFrameData(points, frame, fps);
    expect(result).not.toBeNull();
    expect(result?.properties.progress).toBe(1);
    expect(result?.geometry.coordinates).toEqual([2, 2]);
  });

  test("uses gpxTrimStartSeconds so frame 0 maps to trimmed start elapsed", () => {
    const points = makePoints(3);
    const fps = 10;
    const gpxTrimStartSeconds = 20;
    const result = getFrameData(points, 0, fps, gpxTrimStartSeconds);
    expect(result).not.toBeNull();
    expect(result?.properties.elapsed).toBe(20);
    expect(result?.properties.progress).toBe(1);
  });
});
