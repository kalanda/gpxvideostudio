import { Button, Slider } from "@heroui/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { FC } from "react";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { formatPlaybackTime } from "@/utils/format/formatPlaybackTime";

export type SyncVideoModalVideoControlsProps = {
  videoCurrentTime: number;
  videoDuration: number;
  videoIsPlaying: boolean;
  onSeek: (value: number | number[]) => void;
  onStepFrame: (direction: 1 | -1) => void;
  onTogglePlay: () => void;
};

export const SyncVideoModalVideoControls: FC<
  SyncVideoModalVideoControlsProps
> = ({
  videoCurrentTime,
  videoDuration,
  videoIsPlaying,
  onSeek,
  onStepFrame,
  onTogglePlay,
}) => {
  const fps = useProjectVideoSettingsStore((s) => s.fps);
  const backgroundVideoUrl = useBackgroundVideoStore(
    (s) => s.backgroundVideoUrl,
  );
  const isDisabled = !backgroundVideoUrl;

  return (
    <div className="flex flex-col gap-4">
      <Slider
        size="sm"
        step={1 / fps}
        minValue={0}
        maxValue={Math.max(1, videoDuration)}
        value={videoCurrentTime}
        onChange={onSeek}
        aria-label="Video position"
        isDisabled={isDisabled}
      />
      <p className="text-xs text-foreground/50 font-mono tabular-nums text-center">
        Video time: {formatPlaybackTime(videoCurrentTime)}
        {" / "}
        {formatPlaybackTime(videoDuration)}
      </p>
      <div className="flex items-center gap-2 justify-center">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={() => onStepFrame(-1)}
          isDisabled={isDisabled}
          aria-label="Previous frame"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={onTogglePlay}
          isDisabled={isDisabled}
          aria-label={videoIsPlaying ? "Pause" : "Play"}
        >
          {videoIsPlaying ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={() => onStepFrame(1)}
          isDisabled={isDisabled}
          aria-label="Next frame"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
