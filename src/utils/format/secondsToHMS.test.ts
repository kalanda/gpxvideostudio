import { describe, expect, test } from "vitest";
import { secondsToHMS } from "./secondsToHMS";

describe("secondsToHMS", () => {
  test("splits zero", () => {
    expect(secondsToHMS(0)).toEqual({ h: 0, m: 0, s: 0 });
  });

  test("splits seconds only", () => {
    expect(secondsToHMS(45)).toEqual({ h: 0, m: 0, s: 45 });
  });

  test("splits minutes and seconds", () => {
    expect(secondsToHMS(90)).toEqual({ h: 0, m: 1, s: 30 });
  });

  test("splits hours, minutes, seconds", () => {
    expect(secondsToHMS(3661)).toEqual({ h: 1, m: 1, s: 1 });
  });

  test("floors fractional seconds", () => {
    expect(secondsToHMS(65.9)).toEqual({ h: 0, m: 1, s: 5 });
  });
});
