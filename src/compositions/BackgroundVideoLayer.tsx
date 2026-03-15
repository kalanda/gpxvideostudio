import { Video } from "@remotion/media";
import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useShallow } from "zustand/react/shallow";
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
    flipHorizontal,
    flipVertical,
  } = useBackgroundVideoStore(
    useShallow((s) => ({
      backgroundVideoUrl: s.backgroundVideoUrl,
      backgroundVideoDurationSeconds: s.backgroundVideoDurationSeconds,
      videoTrimStartSeconds: s.videoTrimStartSeconds,
      videoTrimEndSeconds: s.videoTrimEndSeconds,
      flipHorizontal: s.flipHorizontal,
      flipVertical: s.flipVertical,
    })),
  );
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

  const transformParts = [
    flipHorizontal ? "scaleX(-1)" : "",
    flipVertical ? "scaleY(-1)" : "",
  ].filter(Boolean);
  const transform = transformParts.length > 0 ? transformParts.join(" ") : undefined;

  return (
    <AbsoluteFill>
      <Video
        src={backgroundVideoUrl}
        className="h-full w-full object-cover"
        style={transform != null ? { transform } : undefined}
        loop={false}
        trimBefore={trimBeforeFrames}
        {...(trimAfterFrames != null && { trimAfter: trimAfterFrames })}
      />
    </AbsoluteFill>
  );
};
