import { describe, expect, test } from "vitest";
import { computeSyncOffset } from "./computeSyncOffset";

describe("computeSyncOffset", () => {
  test("returns 0 when videoStartTimestamp is null", () => {
    expect(computeSyncOffset(null, new Date("2024-01-01T10:00:00Z"))).toBe(0);
  });

  test("returns 0 when gpxStartTime is null", () => {
    expect(computeSyncOffset(new Date("2024-01-01T10:00:00Z"), null)).toBe(0);
  });

  test("returns 0 when both are null", () => {
    expect(computeSyncOffset(null, null)).toBe(0);
  });

  test("returns positive offset when video starts after GPX", () => {
    const gpxStart = new Date("2024-01-01T10:00:00Z");
    const videoStart = new Date("2024-01-01T10:00:30Z"); // 30s later
    expect(computeSyncOffset(videoStart, gpxStart)).toBe(30);
  });

  test("returns negative offset when video starts before GPX", () => {
    const gpxStart = new Date("2024-01-01T10:00:30Z");
    const videoStart = new Date("2024-01-01T10:00:00Z"); // 30s earlier
    expect(computeSyncOffset(videoStart, gpxStart)).toBe(-30);
  });

  test("returns 0 when both timestamps are equal", () => {
    const ts = new Date("2024-01-01T10:00:00Z");
    expect(computeSyncOffset(ts, ts)).toBe(0);
  });
});
