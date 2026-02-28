import { describe, expect, test } from "vitest";
import { formatFileWeight } from "./formatFileWeight";

describe("formatFileWeight", () => {
  test("formats weight in bytes to a readable string (KB, MB, GB)", () => {
    expect(formatFileWeight(0)).toBe("0 bytes");
    expect(formatFileWeight(1024)).toBe("1.00 KB");
    expect(formatFileWeight(1024 * 1024)).toBe("1.00 MB");
    expect(formatFileWeight(1024 * 1024 * 1024)).toBe("1.00 GB");
  });
});
