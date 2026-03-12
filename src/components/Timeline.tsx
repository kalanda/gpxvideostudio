import { Button } from "@heroui/react";
import { Minus, Plus } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { TimelineRuler } from "@/components/TimelineRuler";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { useVideoSettingsStore } from "@/stores/videoSettingsStore";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const PIXELS_PER_FRAME_BASE = 2;

/**
 * Timeline component for video composition.
 * Shows a track container, playback cursor (synced with video preview),
 * horizontal scroll when content overflows, and zoom controls.
 */
export const Timeline: FC = () => {
  useVideoPlayer();
  const { currentFrame, seekTo } = useVideoPlayerControls();
  const { durationInFrames } = useEffectiveExportDuration();
  const fps = useVideoSettingsStore((s) => s.fps);
  const [zoomLevel, setZoomLevel] = useState(1);

  const totalFrames = Math.max(1, durationInFrames);
  const contentWidthPx = totalFrames * PIXELS_PER_FRAME_BASE * zoomLevel;
  const durationSeconds = totalFrames / fps;
  // px/s: how many pixels represent one second at the current zoom
  const pixelsPerSecond = fps * PIXELS_PER_FRAME_BASE * zoomLevel;
  const currentTimeSeconds = currentFrame / fps;
  const cursorLeftPercent =
    durationSeconds > 0
      ? Math.min(100, (currentTimeSeconds / durationSeconds) * 100)
      : 0;

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  };

  return (
    <section
      className="flex w-full min-w-0 flex-col gap-2 rounded-small bg-default-100 px-3 py-2"
      aria-label="Timeline"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            aria-label="Zoom out"
            onPress={handleZoomOut}
            isDisabled={zoomLevel <= MIN_ZOOM}
          >
            <Minus size={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            aria-label="Zoom in"
            onPress={handleZoomIn}
            isDisabled={zoomLevel >= MAX_ZOOM}
          >
            <Plus size={16} />
          </Button>
          <span className="min-w-[4ch] text-small tabular-nums text-default-500">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      <div className="min-h-0 w-full overflow-x-auto rounded-small bg-default-200">
        <div
          className="relative flex flex-col"
          style={{ width: contentWidthPx, minHeight: "6rem" }}
        >
          <TimelineRuler
            durationSeconds={durationSeconds}
            pixelsPerSecond={pixelsPerSecond}
            totalFrames={totalFrames}
            onSeek={seekTo}
          />

          {/* Track container placeholder – tracks will be added later */}
          <div
            className="relative min-h-16 flex-1 rounded-b-small bg-default-100/80"
            aria-hidden
          />

          {/* Playback position cursor, synced with video preview */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 min-w-[2px] bg-primary shadow-sm"
            style={{
              left: `${cursorLeftPercent}%`,
              transform: cursorLeftPercent <= 0 ? "none" : "translateX(-50%)",
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};
