import { describe, expect, test } from "vitest";
import { msToKmh } from "./msToKmh";

describe("msToKmh", () => {
  test("converts m/s to km/h", () => {
    expect(msToKmh(0)).toBe(0);
    expect(msToKmh(1)).toBe(3.6);
    expect(msToKmh(10)).toBe(36);
  });
});
