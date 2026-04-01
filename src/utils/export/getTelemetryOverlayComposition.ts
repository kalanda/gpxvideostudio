import { MainComposition } from "@/compositions/MainComposition";

export type TelemetryOverlayCompositionParams = {
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
};

export function getTelemetryOverlayComposition(
  params: TelemetryOverlayCompositionParams,
) {
  const { durationInFrames, fps, width, height } = params;
  return {
    id: "telemetry-overlay" as const,
    component: MainComposition,
    durationInFrames,
    fps,
    width,
    height,
    defaultProps: { hideBackgroundVideo: false },
  };
}
