import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { BackgroundVideoLayer } from "@/compositions/BackgroundVideoLayer";
import { TelemetryOverlayLayout } from "@/compositions/TelemetryOverlayLayout";

export type MainCompositionProps = {
  hideBackgroundVideo?: boolean;
};

export const MainComposition: FC<MainCompositionProps> = (props) => {
  const { hideBackgroundVideo = false } = props;

  return (
    <AbsoluteFill>
      <BackgroundVideoLayer hide={hideBackgroundVideo} />
      <TelemetryOverlayLayout />
    </AbsoluteFill>
  );
};
