import { point } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import { describe, expect, test } from "vitest";
import type { TelemetryPoint } from "@/types/telemetry";
import { smoothSlopes } from "./smoothSlopes";

function makeFeature(
  distance: number,
  slope = 0,
): Feature<Point, TelemetryPoint> {
  return point([0, 0], {
    index: 0,
    elevation: null,
    time: new Date(),
    speed: 0,
    distance,
    slope,
    elapsed: 0,
    bearing: 0,
    hr: null,
    cad: null,
    power: null,
    temp: null,
  } as TelemetryPoint);
}

describe("smoothSlopes", () => {
  test("does not throw on empty input", () => {
    expect(() => smoothSlopes([], [])).not.toThrow();
  });

  test("single feature with identical lo/hi elevation gives slope 0", () => {
    const features = [makeFeature(0)];
    smoothSlopes(features, [100], 10);
    expect(features[0].properties.slope).toBe(0);
  });

  test("flat smoothed elevation produces slope 0", () => {
    const features = [
      makeFeature(0),
      makeFeature(10),
      makeFeature(20),
      makeFeature(30),
    ];
    const smoothedEle: (number | null)[] = [500, 500, 500, 500];
    smoothSlopes(features, smoothedEle, 15);
    for (const f of features) expect(f.properties.slope).toBe(0);
  });

  test("constant positive climb produces correct slope", () => {
    // 4 m rise over 40 m distance = 10 %
    const features = [
      makeFeature(0),
      makeFeature(10),
      makeFeature(20),
      makeFeature(30),
      makeFeature(40),
    ];
    // smoothedEle: 100, 101, 102, 103, 104
    const smoothedEle: (number | null)[] = [100, 101, 102, 103, 104];
    smoothSlopes(features, smoothedEle, 20);

    // For the middle point (dist 20, idx 2):
    //   loIdx walks back while 20 - dist[loIdx-1] ≤ 20 → reaches idx 0 (dist 0)
    //   hiIdx walks forward while dist[hiIdx+1] - 20 ≤ 20 → reaches idx 4 (dist 40)
    //   slope = (104 - 100) / 40 * 100 = 10 %
    expect(features[2].properties.slope).toBeCloseTo(10);
  });

  test("constant descent produces negative slope", () => {
    const features = [makeFeature(0), makeFeature(10), makeFeature(20)];
    const smoothedEle: (number | null)[] = [200, 190, 180]; // -10 m over 20 m = -50%
    smoothSlopes(features, smoothedEle, 10);
    // Middle point: lo=0 (dist 0), hi=2 (dist 20) → (180-200)/20*100 = -100%...
    // wait, halfWindowM=10 → lo walks back while 10-dist[loIdx-1] ≤ 10:
    // idx 1: 10-0=10 ≤ 10 → loIdx=0. idx 2: 20-0=20 > 10 → stop.
    // hi walks forward while dist[hiIdx+1]-10 ≤ 10: 20-10=10 ≤ 10 → hiIdx=2.
    // slope = (180-200)/(20-0)*100 = -100%
    expect(features[1].properties.slope).toBeCloseTo(-100);
  });

  test("null in smoothedEle produces slope 0", () => {
    const features = [makeFeature(0), makeFeature(10), makeFeature(20)];
    const smoothedEle: (number | null)[] = [null, 200, 210];
    smoothSlopes(features, smoothedEle, 20);
    // Middle point: loIdx=0 (null) → slope = 0
    expect(features[1].properties.slope).toBe(0);
  });

  test("mutates slope in place and leaves other properties untouched", () => {
    const features = [makeFeature(0, 99), makeFeature(20, 99)];
    const smoothedEle: (number | null)[] = [100, 200];
    smoothSlopes(features, smoothedEle, 10);
    // Slopes are mutated
    expect(features[0].properties.slope).not.toBe(99);
    expect(features[1].properties.slope).not.toBe(99);
    // Other properties unchanged
    expect(features[0].properties.speed).toBe(0);
    expect(features[1].properties.distance).toBe(20);
  });

  test("halfWindowM limits which boundary points are used", () => {
    // Points at 0, 10, 20, 30, 40; smoothedEle rises 1 m per 10 m
    const features = [
      makeFeature(0),
      makeFeature(10),
      makeFeature(20),
      makeFeature(30),
      makeFeature(40),
    ];
    const smoothedEle: (number | null)[] = [100, 101, 102, 103, 104];

    // halfWindowM=5: spacing is 10 m so no neighbour is within 5 m → loIdx=hiIdx=i → distDelta=0 → slope=0
    smoothSlopes(features, smoothedEle, 5);
    for (const f of features) expect(f.properties.slope).toBe(0);

    // halfWindowM=10: each point reaches exactly one neighbour on each side
    smoothSlopes(features, smoothedEle, 10);
    // Middle point (idx 2, dist 20): lo=1 (dist 10), hi=3 (dist 30)
    //   slope = (103-101)/20*100 = 10%
    expect(features[2].properties.slope).toBeCloseTo(10);
  });

  test("boundary points use only available neighbours", () => {
    const features = [makeFeature(0), makeFeature(10), makeFeature(20)];
    const smoothedEle: (number | null)[] = [100, 110, 130];
    smoothSlopes(features, smoothedEle, 10);

    // First point (idx 0): loIdx stays 0, hiIdx reaches 1
    //   slope = (110-100)/10*100 = 100%
    expect(features[0].properties.slope).toBeCloseTo(100);

    // Last point (idx 2): loIdx reaches 1, hiIdx stays 2
    //   slope = (130-110)/10*100 = 200%
    expect(features[2].properties.slope).toBeCloseTo(200);
  });
});
