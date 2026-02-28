import { describe, expect, test } from "vitest";
import { formatSlope } from "./formatSlope";

describe("formatSlope", () => {
  test("formats positive with plus sign", () => {
    expect(formatSlope(5.2)).toBe("+5.2");
  });

  test("formats negative without plus", () => {
    expect(formatSlope(-3.1)).toBe("-3.1");
  });

  test("formats zero with plus", () => {
    expect(formatSlope(0)).toBe("+0.0");
  });
});
