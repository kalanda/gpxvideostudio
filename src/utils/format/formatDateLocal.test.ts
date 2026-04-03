import { describe, expect, test } from "vitest";
import { formatDateLocal } from "./formatDateLocal";

describe("formatDateLocal", () => {
  test("formats date in local timezone (structure: day month year)", () => {
    const d = new Date("2024-07-15T10:00:00Z");
    const result = formatDateLocal(d);
    expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/);
    expect(result.length).toBeGreaterThan(0);
  });

  test("returns consistent result for same instant", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(formatDateLocal(d)).toBe(formatDateLocal(d));
  });
});
