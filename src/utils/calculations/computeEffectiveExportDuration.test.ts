import { describe, expect, test } from "vitest";
import { computeEffectiveExportDuration } from "./computeEffectiveExportDuration";

describe("computeEffectiveExportDuration", () => {
  const fps = 30;

  test("no video: effective duration is full GPX segment", () => {
    const { effectiveDurationSeconds, durationInFrames } =
      computeEffectiveExportDuration({
        gpxDurationSeconds: 120,
        gpxTrimStartSeconds: 0,
        gpxTrimEndSeconds: 0,
        videoDurationSeconds: null,
        videoTrimStartSeconds: 0,
        videoTrimEndSeconds: 0,
        fps,
      });
    expect(effectiveDurationSeconds).toBe(120);
    expect(durationInFrames).toBe(3600);
  });

  test("GPX trim: effective duration is segment between start and end", () => {
    const { effectiveDurationSeconds, durationInFrames } =
      computeEffectiveExportDuration({
        gpxDurationSeconds: 100,
        gpxTrimStartSeconds: 20,
        gpxTrimEndSeconds: 80,
        videoDurationSeconds: null,
        videoTrimStartSeconds: 0,
        videoTrimEndSeconds: 0,
        fps,
      });
    expect(effectiveDurationSeconds).toBe(60);
    expect(durationInFrames).toBe(1800);
  });

  test("video shorter than GPX: effective duration is video segment", () => {
    const { effectiveDurationSeconds } = computeEffectiveExportDuration({
      gpxDurationSeconds: 120,
      gpxTrimStartSeconds: 0,
      gpxTrimEndSeconds: 0,
      videoDurationSeconds: 60,
      videoTrimStartSeconds: 0,
      videoTrimEndSeconds: 0,
      fps,
    });
    expect(effectiveDurationSeconds).toBe(60);
  });

  test("video trim: effective duration is min of both segments", () => {
    const { effectiveDurationSeconds } = computeEffectiveExportDuration({
      gpxDurationSeconds: 100,
      gpxTrimStartSeconds: 0,
      gpxTrimEndSeconds: 0,
      videoDurationSeconds: 50,
      videoTrimStartSeconds: 10,
      videoTrimEndSeconds: 40,
      fps,
    });
    expect(effectiveDurationSeconds).toBe(30);
  });

  test("durationInFrames is at least 1", () => {
    const { durationInFrames } = computeEffectiveExportDuration({
      gpxDurationSeconds: 0.01,
      gpxTrimStartSeconds: 0,
      gpxTrimEndSeconds: 0,
      videoDurationSeconds: null,
      videoTrimStartSeconds: 0,
      videoTrimEndSeconds: 0,
      fps: 30,
    });
    expect(durationInFrames).toBe(1);
  });
});
