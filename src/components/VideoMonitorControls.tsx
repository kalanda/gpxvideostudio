import { Button, Slider } from "@heroui/react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { FC } from "react";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { formatPlaybackTime } from "@/utils/format/formatPlaybackTime";

export type VideoMonitorControlsProps = {
  fps: number;
  durationInFrames: number;
};

export const VideoMonitorControls: FC<VideoMonitorControlsProps> = ({
  fps,
  durationInFrames,
}) => {
  const {
    currentFrame,
    isPlaying,
    isMuted,
    isFullscreen,
    supportsFullscreen,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seekTo,
  } = useVideoPlayerControls();

  const durationSeconds = durationInFrames / fps;
  const currentSeconds = currentFrame / fps;

  const onSeek = (value: number | number[]) => {
    const frame = typeof value === "number" ? value : (value[0] ?? 0);
    seekTo(frame);
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-b-small bg-default-100 px-2 py-1.5">
      <Slider
        size="sm"
        step={1}
        minValue={0}
        maxValue={Math.max(1, durationInFrames)}
        value={currentFrame}
        onChange={onSeek}
        aria-label="Video position"
      />
      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label={isPlaying ? "Pause" : "Play"}
          onPress={togglePlay}
          className="min-w-8"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </Button>

        <div className="flex items-center font-mono text-xs text-foreground tabular-nums gap-1">
          <span className="text-primary">
            {formatPlaybackTime(currentSeconds)}
          </span>
          <span className="text-foreground/40">{` / `}</span>
          <span className="text-foreground">
            {formatPlaybackTime(durationSeconds)}
          </span>
        </div>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label={isMuted ? "Unmute" : "Mute"}
          onPress={toggleMute}
          className="min-w-8"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>

        {supportsFullscreen && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onPress={toggleFullscreen}
            className="ml-auto min-w-8 text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </Button>
        )}
      </div>
    </div>
  );
};
