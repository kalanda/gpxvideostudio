import { describe, expect, test } from "vitest";
import { lerp } from "./lerp";

describe("lerp", () => {
  test("interpolates between two numbers at t=0", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(100, 200, 0)).toBe(100);
  });

  test("interpolates between two numbers at t=1", () => {
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(100, 200, 1)).toBe(200);
  });

  test("interpolates at t=0.5", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 30, 0.5)).toBe(20);
  });

  test("handles arbitrary t in [0,1]", () => {
    expect(lerp(0, 100, 0.25)).toBe(25);
    expect(lerp(0, 100, 0.75)).toBe(75);
  });

  test("returns a when b is null", () => {
    expect(lerp(5, null, 0.5)).toBe(5);
  });

  test("returns b when a is null", () => {
    expect(lerp(null, 10, 0.5)).toBe(10);
  });

  test("returns null when both are null", () => {
    expect(lerp(null, null, 0.5)).toBe(null);
  });

  test("interpolates when both are numbers with null overload", () => {
    const a: number | null = 0;
    const b: number | null = 10;
    expect(lerp(a, b, 0.5)).toBe(5);
  });
});
