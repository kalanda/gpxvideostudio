import { describe, expect, test } from "vitest";
import { formatPlaybackTime } from "./formatPlaybackTime";

describe("formatPlaybackTime", () => {
  test("formats zero as 00:00:00", () => {
    expect(formatPlaybackTime(0)).toBe("00:00:00");
  });

  test("formats seconds only", () => {
    expect(formatPlaybackTime(45)).toBe("00:00:45");
  });

  test("formats minutes and seconds", () => {
    expect(formatPlaybackTime(90)).toBe("00:01:30");
  });

  test("formats hours, minutes and seconds", () => {
    expect(formatPlaybackTime(3661)).toBe("01:01:01");
  });

  test("pads single-digit segments with leading zeros", () => {
    expect(formatPlaybackTime(3600 + 60 + 5)).toBe("01:01:05");
  });

  test("floors fractional seconds", () => {
    expect(formatPlaybackTime(65.9)).toBe("00:01:05");
  });

  test("clamps negative values to 00:00:00", () => {
    expect(formatPlaybackTime(-5)).toBe("00:00:00");
  });
});
