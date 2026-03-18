import { Alert, Button, useDisclosure } from "@heroui/react";
import { Player } from "@remotion/player";
import { Download, MonitorPlay, Settings } from "lucide-react";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { ExportVideoModal } from "@/components/ExportVideoModal";
import { MiniCard } from "@/components/MiniCard";
import { VideoMonitorEmptyState } from "@/components/VideoMonitorEmptyState";
import { VideoSettingsModal } from "@/components/VideoSettingsModal";
import { WidgetAppearanceDropdown } from "@/components/WidgetAppearanceDropdown";
import { MainComposition } from "@/compositions/MainComposition";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useExporter } from "@/hooks/useExporter";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { useTelemetryStore } from "@/stores/telemetryStore";

export const VideoMonitor: FC = () => {
  const { playerRef } = useVideoPlayer();
  const savedFrameRef = useRef<number | null>(null);
  const { fps, width, height } = useProjectVideoSettingsStore(
    useShallow((s) => ({ fps: s.fps, width: s.width, height: s.height })),
  );
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const trimPreviewSeconds = useBackgroundVideoStore(
    (s) => s.trimPreviewSeconds,
  );
  const { durationInFrames, videoTimeAtFrame0 } = useEffectiveExportDuration();
  const { error, canExport } = useExporter();
  const {
    isOpen: isVideoSettingsModalOpen,
    onOpen: onVideoSettingsModalOpen,
    onClose: onVideoSettingsModalClose,
  } = useDisclosure();
  const {
    isOpen: isExportModalOpen,
    onOpen: onExportModalOpen,
    onClose: onExportModalClose,
  } = useDisclosure();

  // When editing trim, preview the frame at the trim edge; on release, restore playback position.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (trimPreviewSeconds == null) {
      if (savedFrameRef.current !== null) {
        player.seekTo(Math.round(savedFrameRef.current));
        savedFrameRef.current = null;
      }
      return;
    }

    if (savedFrameRef.current === null) {
      savedFrameRef.current = player.getCurrentFrame();
    }
    const frame = (trimPreviewSeconds - videoTimeAtFrame0) * fps;
    const clampedFrame = Math.max(
      0,
      Math.min(durationInFrames - 1, Math.round(frame)),
    );
    player.seekTo(clampedFrame);
  }, [
    trimPreviewSeconds,
    videoTimeAtFrame0,
    fps,
    durationInFrames,
    playerRef,
  ]);

  return (
    <>
      <MiniCard
        title="Preview"
        titleIcon={<MonitorPlay size={16} className="shrink-0" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {telemetryPoints && <WidgetAppearanceDropdown />}
            <Button
              size="sm"
              variant="flat"
              aria-label={`Resolution: ${width}x${height} @ ${fps} FPS`}
              title={`Resolution: ${width}x${height} @ ${fps} FPS`}
              onPress={onVideoSettingsModalOpen}
              startContent={<Settings size={16} />}
            >
              <span className="hidden sm:inline">
                {`Resolution: ${width}x${height} @ ${fps} FPS`}
              </span>
              <span className="sm:hidden">{`${width}×${height}`}</span>
            </Button>
            {telemetryPoints && (
              <Button
                color="primary"
                size="sm"
                onPress={onExportModalOpen}
                isDisabled={!canExport}
                startContent={<Download size={18} />}
              >
                Export video
              </Button>
            )}
          </div>
        }
      >
        {telemetryPoints && error && (
          <Alert color="danger" variant="flat" description={error} />
        )}
        <div className="flex w-full flex-col">
          {/*
           * Width is the min of:
           *   - 100% of the container (narrow viewports — height derives from aspect ratio)
           *   - maxH × (w/h): the width that exactly fills the max allowed height (wide viewports)
           * Height is always auto-derived from aspect-ratio, so there is never any letterboxing.
           */}
          <div
            style={{
              width: `min(100%, min(50vh, 700px) * ${width} / ${height})`,
              margin: "0 auto",
              aspectRatio: `${width} / ${height}`,
              position: "relative",
            }}
          >
            {!telemetryPoints && <VideoMonitorEmptyState />}
            <Player
              ref={playerRef}
              key={`${width}x${height}-${fps}`}
              component={MainComposition}
              durationInFrames={durationInFrames}
              fps={fps}
              compositionWidth={width}
              compositionHeight={height}
              controls={true}
              autoPlay={false}
              loop={false}
              acknowledgeRemotionLicense
              style={{
                width: "100%",
                backgroundColor: "black",
              }}
            />
          </div>
        </div>
      </MiniCard>

      <VideoSettingsModal
        isOpen={isVideoSettingsModalOpen}
        onFinish={onVideoSettingsModalClose}
      />
      <ExportVideoModal
        isOpen={isExportModalOpen}
        onClose={onExportModalClose}
      />
    </>
  );
};
