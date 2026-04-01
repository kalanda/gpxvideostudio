import { describe, expect, it } from "vitest";
import { MainComposition } from "@/compositions/MainComposition";
import { getTelemetryOverlayComposition } from "./getTelemetryOverlayComposition";

describe("getTelemetryOverlayComposition", () => {
  it("returns Remotion composition metadata for the main overlay", () => {
    const spec = getTelemetryOverlayComposition({
      durationInFrames: 120,
      fps: 30,
      width: 1920,
      height: 1080,
    });

    expect(spec.id).toBe("telemetry-overlay");
    expect(spec.component).toBe(MainComposition);
    expect(spec.durationInFrames).toBe(120);
    expect(spec.fps).toBe(30);
    expect(spec.width).toBe(1920);
    expect(spec.height).toBe(1080);
    expect(spec.defaultProps).toEqual({ hideBackgroundVideo: false });
  });
});
