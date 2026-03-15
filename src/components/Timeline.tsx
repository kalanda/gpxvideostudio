import { Button } from "@heroui/react";
import { GanttChart, Minus, Plus } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { TimelinePlaybackCursor } from "@/components/TimelinePlaybackCursor";
import { TimelineRuler } from "@/components/TimelineRuler";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { MiniCard } from "./MiniCard";

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
  const fps = useProjectVideoSettingsStore((s) => s.fps);
  const [zoomLevel, setZoomLevel] = useState(1);

  const totalFrames = Math.max(1, durationInFrames);
  const pixelsPerFrame = PIXELS_PER_FRAME_BASE * zoomLevel;
  const contentWidthPx = totalFrames * pixelsPerFrame;
  const durationSeconds = totalFrames / fps;
  // px/s: how many pixels represent one second at the current zoom
  const pixelsPerSecond = fps * pixelsPerFrame;
  const cursorLeftPx = Math.min(currentFrame * pixelsPerFrame, contentWidthPx);

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  };

  const actions = (
    <>
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
      <span className="min-w-[4ch] text-small tabular-nums text-default-500">
        {Math.round(zoomLevel * 100)}%
      </span>
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
    </>
  );

  return (
    <MiniCard
      title="Timeline"
      titleIcon={<GanttChart size={16} />}
      actions={actions}
    >
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
          <TimelinePlaybackCursor leftPx={cursorLeftPx} />
        </div>
      </div>
    </MiniCard>
  );
};
