import { Video } from "@remotion/media";
import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";

export type BackgroundVideoLayerProps = {
  /** When true, the layer renders nothing (e.g. for preview without video). */
  hide?: boolean;
};

export const BackgroundVideoLayer: FC<BackgroundVideoLayerProps> = (props) => {
  const { hide = false } = props;
  const {
    backgroundVideoUrl,
    backgroundVideoDurationSeconds,
    videoTrimStartSeconds,
    videoTrimEndSeconds,
  } = useBackgroundVideoStore();
  const { fps } = useVideoConfig();

  if (hide || !backgroundVideoUrl) return null;

  const videoSegmentEnd =
    backgroundVideoDurationSeconds != null &&
    backgroundVideoDurationSeconds > 0 &&
    videoTrimEndSeconds > 0
      ? Math.min(videoTrimEndSeconds, backgroundVideoDurationSeconds)
      : (backgroundVideoDurationSeconds ?? 0);
  const trimBeforeFrames = Math.round(videoTrimStartSeconds * fps);
  const trimAfterFramesRaw = Math.round(videoSegmentEnd * fps);
  const trimAfterFrames =
    videoSegmentEnd > 0 && trimAfterFramesRaw > trimBeforeFrames
      ? trimAfterFramesRaw
      : undefined;

  return (
    <AbsoluteFill>
      <Video
        src={backgroundVideoUrl}
        className="h-full w-full object-cover"
        loop={false}
        trimBefore={trimBeforeFrames}
        {...(trimAfterFrames != null && { trimAfter: trimAfterFrames })}
      />
    </AbsoluteFill>
  );
};
