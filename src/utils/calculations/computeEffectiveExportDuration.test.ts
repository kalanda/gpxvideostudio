import { describe, expect, test } from "vitest";
import { computeEffectiveExportDuration } from "./computeEffectiveExportDuration";

const fps = 30;

const base = {
  gpxDurationSeconds: 120,
  syncOffsetSeconds: 0,
  videoDurationSeconds: null as number | null,
  videoTrimStartSeconds: 0,
  videoTrimEndSeconds: 0,
  fps,
};

describe("computeEffectiveExportDuration — no video", () => {
  test("full GPX track, no trims", () => {
    const { effectiveDurationSeconds, durationInFrames, gpxElapsedAtExportStart } =
      computeEffectiveExportDuration({ ...base });
    expect(effectiveDurationSeconds).toBe(120);
    expect(durationInFrames).toBe(3600);
    expect(gpxElapsedAtExportStart).toBe(0);
  });

  test("durationInFrames is at least 1", () => {
    const { durationInFrames } = computeEffectiveExportDuration({
      ...base,
      gpxDurationSeconds: 0.01,
    });
    expect(durationInFrames).toBe(1);
  });
});

describe("computeEffectiveExportDuration — video only (no GPX)", () => {
  test("video segment drives duration when gpxDuration is 0", () => {
    const { effectiveDurationSeconds, videoTimeAtFrame0 } =
      computeEffectiveExportDuration({
        ...base,
        gpxDurationSeconds: 0,
        videoDurationSeconds: 60,
        videoTrimStartSeconds: 10,
        videoTrimEndSeconds: 40,
      });
    expect(effectiveDurationSeconds).toBe(30);
    expect(videoTimeAtFrame0).toBe(10);
  });
});

describe("computeEffectiveExportDuration — video trim determines export", () => {
  test("syncOffset shifts GPX start relative to video", () => {
    // Video starts at GPX elapsed 30s (syncOffset=30, videoTrimStart=0).
    // GPX has no trim. Video is 60s. Export = 60s (video is the limit).
    const { effectiveDurationSeconds, gpxElapsedAtExportStart, videoTimeAtFrame0 } =
      computeEffectiveExportDuration({
        ...base,
        syncOffsetSeconds: 30,
        videoDurationSeconds: 60,
      });
    expect(gpxElapsedAtExportStart).toBe(30);
    expect(videoTimeAtFrame0).toBe(0);
    expect(effectiveDurationSeconds).toBe(60);
  });

  test("videoTrimStart moves both video and GPX start together", () => {
    const { gpxElapsedAtExportStart, videoTimeAtFrame0 } =
      computeEffectiveExportDuration({
        ...base,
        syncOffsetSeconds: 30,
        videoDurationSeconds: 90,
        videoTrimStartSeconds: 10,
      });
    expect(gpxElapsedAtExportStart).toBe(40);
    expect(videoTimeAtFrame0).toBe(10);
  });

  test("video shorter than GPX: effective duration is video segment", () => {
    const { effectiveDurationSeconds } = computeEffectiveExportDuration({
      ...base,
      videoDurationSeconds: 60,
    });
    expect(effectiveDurationSeconds).toBe(60);
  });

  test("video trim start + end both apply", () => {
    const { effectiveDurationSeconds } = computeEffectiveExportDuration({
      ...base,
      videoDurationSeconds: 50,
      videoTrimStartSeconds: 10,
      videoTrimEndSeconds: 40,
    });
    expect(effectiveDurationSeconds).toBe(30);
  });

  test("gpxElapsedAtExportStart equals syncOffset + videoTrimStart", () => {
    const { gpxElapsedAtExportStart } = computeEffectiveExportDuration({
      ...base,
      syncOffsetSeconds: 45,
      videoDurationSeconds: 120,
      videoTrimStartSeconds: 15,
    });
    expect(gpxElapsedAtExportStart).toBe(60);
  });

  test("video extends beyond GPX: export is capped by GPX end", () => {
    // Video 0→120s, syncOffset=20 → GPX 20→140. GPX ends at 120.
    const { effectiveDurationSeconds } = computeEffectiveExportDuration({
      ...base,
      syncOffsetSeconds: 20,
      videoDurationSeconds: 120,
    });
    // Export = GPX 20→120 = 100s
    expect(effectiveDurationSeconds).toBe(100);
  });
});
