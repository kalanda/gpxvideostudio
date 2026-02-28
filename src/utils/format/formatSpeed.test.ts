import { describe, expect, test } from "vitest";
import { formatSpeed } from "./formatSpeed";

describe("formatSpeed", () => {
  test("formats speed as km/h with one decimal", () => {
    expect(formatSpeed(0)).toBe("0.0");
    expect(formatSpeed(1)).toBe("3.6");
  });
});
