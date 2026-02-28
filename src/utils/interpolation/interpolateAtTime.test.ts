import { describe, expect, test } from "vitest";
import { featureCollection, point } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import type {
  TelemetryFeatureCollection,
  TelemetryPoint,
} from "@/types/telemetry";
import { interpolateAtTime } from "./interpolateAtTime";

function makePoints(): TelemetryFeatureCollection {
  const base = new Date("2024-01-01T10:00:00Z").getTime();
  const features: Feature<Point, TelemetryPoint>[] = [
    point([0, 0], {
      index: 0,
      elevation: 100,
      time: new Date(base),
      speed: 0,
      distance: 0,
      slope: 0,
      elapsed: 0,
      bearing: 45,
      hr: 120,
      cad: 80,
      power: 200,
      temp: 20,
    } as TelemetryPoint),
    point([1, 1], {
      index: 1,
      elevation: 110,
      time: new Date(base + 10_000),
      speed: 10,
      distance: 100,
      slope: 1,
      elapsed: 10,
      bearing: 45,
      hr: 130,
      cad: 85,
      power: 210,
      temp: 21,
    } as TelemetryPoint),
    point([2, 2], {
      index: 2,
      elevation: 120,
      time: new Date(base + 20_000),
      speed: 10,
      distance: 200,
      slope: 1,
      elapsed: 20,
      bearing: 45,
      hr: 140,
      cad: 90,
      power: 220,
      temp: 22,
    } as TelemetryPoint),
  ];
  return featureCollection<Point, TelemetryPoint>(features);
}

describe("interpolateAtTime", () => {
  const points = makePoints();
  const totalDuration = 20;

  test("returns first point when elapsed is 0", () => {
    const result = interpolateAtTime(points, 0, 0, totalDuration);
    expect(result.type).toBe("Feature");
    expect(result.geometry.type).toBe("Point");
    expect(result.geometry.coordinates).toEqual([0, 0]);
    expect(result.properties.index).toBe(0);
    expect(result.properties.elapsed).toBe(0);
    expect(result.properties.distance).toBe(0);
    expect(result.properties.progress).toBe(0);
  });

  test("returns last point when elapsed >= totalDuration", () => {
    const result = interpolateAtTime(points, 20, 100, totalDuration);
    expect(result.geometry.coordinates).toEqual([2, 2]);
    expect(result.properties.index).toBe(2);
    expect(result.properties.elapsed).toBe(20);
    expect(result.properties.distance).toBe(200);
    expect(result.properties.progress).toBe(1);
  });

  test("interpolates position and properties at mid-segment", () => {
    const result = interpolateAtTime(points, 5, 50, totalDuration);
    expect(result.geometry.type).toBe("Point");
    expect(result.geometry.coordinates[0]).toBe(0.5);
    expect(result.geometry.coordinates[1]).toBe(0.5);
    expect(result.properties.elapsed).toBe(5);
    expect(result.properties.distance).toBe(50);
    expect(result.properties.frame).toBe(50);
    expect(result.properties.progress).toBe(5 / 20);
  });

  test("interpolates elevation and optional fields", () => {
    const result = interpolateAtTime(points, 5, 0, totalDuration);
    expect(result.properties.elevation).toBe(105);
    expect(result.properties.hr).toBe(125);
    expect(result.properties.slope).toBe(0.5);
  });
});
