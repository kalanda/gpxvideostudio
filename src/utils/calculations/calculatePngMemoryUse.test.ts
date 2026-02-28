import { describe, expect, test } from "vitest";
import { calculatePngMemoryUse } from "./calculatePngMemoryUse";

describe("calculatePngMemoryUse", () => {
  test("returns total frames times weight for given resolution", () => {
    const result = calculatePngMemoryUse(30, 60, 1920, 1080);
    const totalFrames = 30 * 60;
    expect(result).toBe(totalFrames * 210000);
  });

  test("scales with fps and duration", () => {
    const result = calculatePngMemoryUse(24, 10, 1280, 720);
    const totalFrames = 24 * 10;
    expect(result).toBe(totalFrames * 210000);
  });

  test("uses 4k weight for 3840x2160", () => {
    const result = calculatePngMemoryUse(30, 1, 3840, 2160);
    expect(result).toBe(30 * 210000);
  });

  test("ceils duration so fractional seconds add a frame", () => {
    const result = calculatePngMemoryUse(10, 1.1, 1280, 720);
    const totalFrames = Math.ceil(1.1 * 10);
    expect(totalFrames).toBe(11);
    expect(result).toBe(11 * 210000);
  });

  test("returns positive value for small resolution", () => {
    const result = calculatePngMemoryUse(30, 1, 640, 360);
    expect(result).toBeGreaterThan(0);
    expect(result).toBe(30 * 210000);
  });
});
