import type { FC, RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";

export type SyncVideoModalVideoPlayerProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
  onPlay: () => void;
  onPause: () => void;
  onClick: () => void;
};

export const SyncVideoModalVideoPlayer: FC<SyncVideoModalVideoPlayerProps> = ({
  videoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlay,
  onPause,
  onClick,
}) => {
  const { backgroundVideoUrl, flipHorizontal, flipVertical } =
    useBackgroundVideoStore(
      useShallow((s) => ({
        backgroundVideoUrl: s.backgroundVideoUrl,
        flipHorizontal: s.flipHorizontal,
        flipVertical: s.flipVertical,
      })),
    );

  return (
    <div className="relative h-full bg-black rounded-medium overflow-hidden flex items-center justify-center">
      {backgroundVideoUrl ? (
        <video
          ref={videoRef}
          src={backgroundVideoUrl}
          className="max-h-full max-w-full object-contain"
          style={{
            transform:
              [
                flipHorizontal ? "scaleX(-1)" : "",
                flipVertical ? "scaleY(-1)" : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined,
          }}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
          onPlay={onPlay}
          onPause={onPause}
          onClick={onClick}
          playsInline
        >
          <track kind="captions" />
        </video>
      ) : (
        <p className="text-foreground/40 text-sm">No video loaded</p>
      )}
    </div>
  );
};
