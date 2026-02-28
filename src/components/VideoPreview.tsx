import { Alert, Button, useDisclosure } from "@heroui/react";
import { Player } from "@remotion/player";
import { Download, MonitorPlay, Settings } from "lucide-react";
import type { FC } from "react";
import { useRef } from "react";
import { MainComposition } from "@/compositions/MainComposition";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useExporter } from "@/hooks/useExporter";
import { useGpxLoader } from "@/hooks/useGpxLoader";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useVideoSettingsStore } from "@/stores/videoSettingsStore";
import { formatTime } from "@/utils/format/formatTime";
import { ExportVideoModal } from "./ExportVideoModal";
import { MiniCard } from "./MiniCard";
import { VideoSettingsModal } from "./VideoSettingsModal";
import { WidgetAppearanceDropdown } from "./WidgetAppearanceDropdown";

export const VideoPreview: FC = () => {
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const { fps, width, height } = useVideoSettingsStore();
  const { telemetryPoints } = useTelemetryStore();
  const { durationInFrames, effectiveDurationSeconds } =
    useEffectiveExportDuration();
  const { loadFromFile } = useGpxLoader();
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

  const previewTitle = telemetryPoints
    ? `Preview (${formatTime(effectiveDurationSeconds)})`
    : "Preview";

  return (
    <>
      <MiniCard
        title={previewTitle}
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
        <div
          className="relative flex w-full items-center justify-center overflow-hidden rounded-small bg-background-800"
          style={{
            aspectRatio: `${width}/${height}`,
            maxHeight: "min(50vh, 700px)",
          }}
        >
          {!telemetryPoints && (
            <div className="absolute inset-0 z-10 flex w-full flex-col items-center justify-center">
              <input
                ref={gpxInputRef}
                type="file"
                accept=".gpx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void loadFromFile(file);
                }}
                className="hidden"
                aria-hidden
              />
              <Button onPress={() => gpxInputRef.current?.click()}>
                Load a GPX to add the telemetry track
              </Button>
            </div>
          )}
          {/* Wrapper sized to fit inside 16:9 box while keeping video aspect ratio */}
          <div
            className="shrink-0"
            style={{
              aspectRatio: `${width} / ${height}`,
              // Video wider than 16/9: limit by height. Video taller: limit by width.
              maxWidth: "100%",
              maxHeight: "100%",
              width: width / height >= 16 / 9 ? "100%" : undefined,
              height: width / height < 16 / 9 ? "100%" : undefined,
            }}
          >
            <Player
              key={`${width}x${height}-${fps}`}
              component={MainComposition}
              durationInFrames={durationInFrames}
              fps={fps}
              compositionWidth={width}
              compositionHeight={height}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                backgroundColor: "black",
              }}
              controls
              hideControlsWhenPointerDoesntMove
              autoPlay={false}
              loop
              acknowledgeRemotionLicense
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
