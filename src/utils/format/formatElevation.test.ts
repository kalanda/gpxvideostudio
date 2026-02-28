import { describe, expect, test } from "vitest";
import { formatElevation } from "./formatElevation";

describe("formatElevation", () => {
  test("formats meters", () => {
    expect(formatElevation(100)).toBe("100");
    expect(formatElevation(100.7)).toBe("101");
  });

  test("returns -- for null", () => {
    expect(formatElevation(null)).toBe("--");
  });
});
