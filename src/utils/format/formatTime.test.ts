import { describe, expect, test } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  test("formats hh:mm:ss", () => {
    expect(formatTime(0)).toBe("0h 00m 00s");
    expect(formatTime(45)).toBe("0h 00m 45s");
    expect(formatTime(90)).toBe("0h 01m 30s");
    expect(formatTime(3600)).toBe("1h 00m 00s");
    expect(formatTime(3661)).toBe("1h 01m 01s");
  });
});
