import { describe, expect, test } from "vitest";
import { formatTimeLocal } from "./formatTimeLocal";

describe("formatTimeLocal", () => {
  test("formats time in local timezone (structure: HH:mm:ss)", () => {
    const d = new Date("2024-07-15T10:30:45Z");
    const result = formatTimeLocal(d);
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test("pads single digits with zero", () => {
    const d = new Date("2024-07-15T01:02:03Z");
    const result = formatTimeLocal(d);
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});
