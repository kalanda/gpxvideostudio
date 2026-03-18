import { point } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import { describe, expect, test } from "vitest";
import type { TelemetryPoint } from "@/types/telemetry";
import { smoothElevations } from "./smoothElevations";

function makeFeature(
  distance: number,
  elevation: number | null,
): Feature<Point, TelemetryPoint> {
  return point([0, 0], {
    index: 0,
    elevation,
    time: new Date(),
    speed: 0,
    distance,
    slope: 0,
    elapsed: 0,
    bearing: 0,
    hr: null,
    cad: null,
    power: null,
    temp: null,
  } as TelemetryPoint);
}

describe("smoothElevations", () => {
  test("returns empty array for empty input", () => {
    expect(smoothElevations([])).toEqual([]);
  });

  test("returns the same elevation for a single feature", () => {
    const result = smoothElevations([makeFeature(0, 500)]);
    expect(result).toEqual([500]);
  });

  test("returns null when the only feature has null elevation", () => {
    const result = smoothElevations([makeFeature(0, null)]);
    expect(result).toEqual([null]);
  });

  test("preserves null when all features have null elevation", () => {
    const features = [makeFeature(0, null), makeFeature(10, null)];
    expect(smoothElevations(features, 20)).toEqual([null, null]);
  });

  test("averages all features when they all fall within the window", () => {
    // Points at 0, 5, 10 m — halfWindowM=10 includes all three for the middle point
    const features = [
      makeFeature(0, 100),
      makeFeature(5, 110),
      makeFeature(10, 120),
    ];
    const result = smoothElevations(features, 10);
    // The window condition is `<= halfWindowM` so the boundary distance (10 m)
    // is inclusive. All three points see each other → avg = (100+110+120)/3 = 110.
    expect(result[0]).toBeCloseTo((100 + 110 + 120) / 3);
    expect(result[1]).toBeCloseTo((100 + 110 + 120) / 3);
    expect(result[2]).toBeCloseTo((100 + 110 + 120) / 3);
  });

  test("excludes features beyond the half-window", () => {
    // halfWindowM = 5: points more than 5 m away are excluded
    const features = [
      makeFeature(0, 100),
      makeFeature(5, 200), // exactly at boundary — included
      makeFeature(6, 999), // just outside — excluded from point at 0
    ];
    const result = smoothElevations(features, 5);
    expect(result[0]).toBeCloseTo((100 + 200) / 2); // 0 and 5, not 6
    expect(result[1]).toBeCloseTo((100 + 200 + 999) / 3); // 0 (5m away), 5, 6 (1m away)
    expect(result[2]).toBeCloseTo((200 + 999) / 2); // 5 and 6, not 0 (6m away)
  });

  test("returns the point's own elevation when no neighbours fall within the window", () => {
    const features = [
      makeFeature(0, 300),
      makeFeature(100, 400), // 100 m apart, window = 1 m → no cross-visibility
    ];
    const result = smoothElevations(features, 1);
    expect(result[0]).toBe(300);
    expect(result[1]).toBe(400);
  });

  test("skips null elevation neighbours and averages only valid ones", () => {
    const features = [
      makeFeature(0, null),
      makeFeature(5, 200),
      makeFeature(10, 300),
    ];
    const result = smoothElevations(features, 10);
    // Point at 0: null neighbour skipped, valid values are 200 and 300 → avg 250
    expect(result[0]).toBeCloseTo((200 + 300) / 2);
    // Point at 5: null at 0 skipped → avg of 200 and 300
    expect(result[1]).toBeCloseTo((200 + 300) / 2);
    // Point at 10: null at 0 skipped → avg of 200 and 300
    expect(result[2]).toBeCloseTo((200 + 300) / 2);
  });

  test("uses the custom halfWindowM parameter", () => {
    const features = [makeFeature(0, 100), makeFeature(50, 200)];
    // With halfWindowM=10 they cannot see each other (50 > 10)
    expect(smoothElevations(features, 10)).toEqual([100, 200]);
    // With halfWindowM=50 they are at the boundary and both are included
    const result = smoothElevations(features, 50);
    expect(result[0]).toBeCloseTo(150);
    expect(result[1]).toBeCloseTo(150);
  });

  test("output array length equals input array length", () => {
    const features = Array.from({ length: 10 }, (_, i) =>
      makeFeature(i * 5, 100 + i),
    );
    expect(smoothElevations(features, 10)).toHaveLength(10);
  });
});
