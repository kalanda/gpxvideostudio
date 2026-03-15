import { describe, expect, test } from "vitest";
import { computeEffectiveExportDuration } from "./computeEffectiveExportDuration";

const fps = 30;

const base = {
  gpxDurationSeconds: 120,
  gpxTrimStartSeconds: 0,
  gpxTrimEndSeconds: 0,
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

  test("gpxTrimStart and gpxTrimEnd cut the segment", () => {
    const { effectiveDurationSeconds, gpxElapsedAtExportStart } =
      computeEffectiveExportDuration({
        ...base,
        gpxTrimStartSeconds: 20,
        gpxTrimEndSeconds: 80,
      });
    expect(effectiveDurationSeconds).toBe(60);
    expect(gpxElapsedAtExportStart).toBe(20);
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

describe("computeEffectiveExportDuration — intersection model", () => {
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
    // Changing videoTrimStart should NOT affect sync; the GPX just moves with it.
    const { gpxElapsedAtExportStart, videoTimeAtFrame0 } =
      computeEffectiveExportDuration({
        ...base,
        syncOffsetSeconds: 30,
        videoDurationSeconds: 90,
        videoTrimStartSeconds: 10,
      });
    // GPX at frame 0: syncOffset + videoTrimStart = 30 + 10 = 40
    expect(gpxElapsedAtExportStart).toBe(40);
    // Video file position at frame 0: unchanged from videoTrimStart
    expect(videoTimeAtFrame0).toBe(10);
  });

  test("gpxTrimEnd limits the export end independently of sync", () => {
    const { effectiveDurationSeconds } = computeEffectiveExportDuration({
      ...base,
      syncOffsetSeconds: 20,
      gpxTrimEndSeconds: 80,
      videoDurationSeconds: 120,
    });
    // GPX runs 20→80 (60s); video runs 0→120 (120s). Min = 60.
    expect(effectiveDurationSeconds).toBe(60);
  });

  test("gpxTrimStart is the binding constraint: cuts video start too", () => {
    // syncOffset=0, videoTrimStart=0, gpxTrimStart=30 → export starts at GPX=30,
    // which means video starts at 30s in the file (videoTimeAtFrame0=30).
    const { gpxElapsedAtExportStart, videoTimeAtFrame0, effectiveDurationSeconds } =
      computeEffectiveExportDuration({
        ...base,
        gpxTrimStartSeconds: 30,
        gpxTrimEndSeconds: 90,
        videoDurationSeconds: 120,
      });
    expect(gpxElapsedAtExportStart).toBe(30);
    expect(videoTimeAtFrame0).toBe(30);
    expect(effectiveDurationSeconds).toBe(60);
  });

  test("gpxTrimStart < syncOffset+videoTrimStart: video trim is binding, gpxTrimStart has no effect", () => {
    // syncOffset=50, videoTrimStart=10 → videoStartInGpx=60. gpxTrimStart=20 < 60.
    // Export starts at 60 in GPX, video at 10s.
    const { gpxElapsedAtExportStart, videoTimeAtFrame0 } =
      computeEffectiveExportDuration({
        ...base,
        syncOffsetSeconds: 50,
        gpxTrimStartSeconds: 20,
        videoDurationSeconds: 60,
        videoTrimStartSeconds: 10,
      });
    expect(gpxElapsedAtExportStart).toBe(60);
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

  test("gpxElapsedAtExportStart equals syncOffset + videoTrimStart when no gpxTrimStart", () => {
    const { gpxElapsedAtExportStart } = computeEffectiveExportDuration({
      ...base,
      syncOffsetSeconds: 45,
      videoDurationSeconds: 120,
      videoTrimStartSeconds: 15,
    });
    expect(gpxElapsedAtExportStart).toBe(60);
  });
});
