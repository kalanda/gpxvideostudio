import { describe, expect, test } from "vitest";
import { formatTimecode } from "./formatTimecode";

describe("formatTimecode", () => {
  test("formats HH:MM:SS:FF at 30 fps", () => {
    expect(formatTimecode(0, 30)).toBe("00:00:00:00");
    expect(formatTimecode(30, 30)).toBe("00:00:01:00");
    expect(formatTimecode(90, 30)).toBe("00:00:03:00");
  });

  test("includes frame component", () => {
    expect(formatTimecode(1, 30)).toBe("00:00:00:01");
    expect(formatTimecode(61, 30)).toBe("00:00:02:01");
  });
});
