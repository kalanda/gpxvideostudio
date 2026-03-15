import { Video } from "@remotion/media";
import type { FC } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useShallow } from "zustand/react/shallow";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";

export type BackgroundVideoLayerProps = {
  /** When true, the layer renders nothing (e.g. for preview without video). */
  hide?: boolean;
};

export const BackgroundVideoLayer: FC<BackgroundVideoLayerProps> = (props) => {
  const { hide = false } = props;
  const { backgroundVideoUrl, flipHorizontal, flipVertical } =
    useBackgroundVideoStore(
      useShallow((s) => ({
        backgroundVideoUrl: s.backgroundVideoUrl,
        flipHorizontal: s.flipHorizontal,
        flipVertical: s.flipVertical,
      })),
    );
  const { fps } = useVideoConfig();
  const { videoTimeAtFrame0, effectiveDurationSeconds } =
    useEffectiveExportDuration();

  if (hide || !backgroundVideoUrl) return null;

  // trimBefore: where the video file starts playing at export frame 0.
  // trimAfter: where it stops. Both are derived from the intersection of
  // video and GPX segments so they stay consistent with the overlay.
  const trimBeforeFrames = Math.round(videoTimeAtFrame0 * fps);
  const trimAfterRaw = Math.round((videoTimeAtFrame0 + effectiveDurationSeconds) * fps);
  const trimAfterFrames = trimAfterRaw > trimBeforeFrames ? trimAfterRaw : undefined;

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
