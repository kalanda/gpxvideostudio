import { describe, expect, test } from "vitest";
import {
  CUSTOM_PRESET_KEY,
  getMatchingPresetKey,
  type PresetsMap,
} from "./getMatchingPresetKey";

const PRESETS: PresetsMap = {
  "4k": { width: 3840, height: 2160 },
  "2k": { width: 2560, height: 1440 },
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
};

describe("getMatchingPresetKey", () => {
  test("returns preset key when width and height match exactly", () => {
    expect(getMatchingPresetKey(1920, 1080, PRESETS)).toBe("1080p");
    expect(getMatchingPresetKey(3840, 2160, PRESETS)).toBe("4k");
    expect(getMatchingPresetKey(1280, 720, PRESETS)).toBe("720p");
  });

  test("returns preset key when width and height are swapped", () => {
    expect(getMatchingPresetKey(1080, 1920, PRESETS)).toBe("1080p");
    expect(getMatchingPresetKey(2160, 3840, PRESETS)).toBe("4k");
  });

  test("returns CUSTOM_PRESET_KEY when no preset matches", () => {
    expect(getMatchingPresetKey(800, 600, PRESETS)).toBe(CUSTOM_PRESET_KEY);
    expect(getMatchingPresetKey(1920, 1081, PRESETS)).toBe(CUSTOM_PRESET_KEY);
    expect(getMatchingPresetKey(0, 0, PRESETS)).toBe(CUSTOM_PRESET_KEY);
  });

  test("returns CUSTOM_PRESET_KEY for empty presets", () => {
    expect(getMatchingPresetKey(1920, 1080, {})).toBe(CUSTOM_PRESET_KEY);
  });
});
