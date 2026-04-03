import { describe, expect, test } from "vitest";
import { formatDateLocal } from "./formatDateLocal";
import { formatElapsedAsDateTimeLocal } from "./formatElapsedAsDateTimeLocal";
import { formatTimeLocal } from "./formatTimeLocal";

describe("formatElapsedAsDateTimeLocal", () => {
  test("formats elapsed seconds from start time as date + time", () => {
    const startTime = new Date("2024-07-15T10:00:00Z");
    const result = formatElapsedAsDateTimeLocal(90, startTime);
    expect(result).toMatch(/^\d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2}$/);
  });

  test("zero elapsed returns start time formatted", () => {
    const startTime = new Date("2024-01-01T12:00:00Z");
    const result = formatElapsedAsDateTimeLocal(0, startTime);
    expect(result).toBe(
      `${formatDateLocal(startTime)} ${formatTimeLocal(startTime)}`,
    );
  });
});
