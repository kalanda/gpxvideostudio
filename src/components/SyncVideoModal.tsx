import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Link2 } from "lucide-react";
import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import { SyncVideoModalMapControls } from "@/components/SyncVideoModalMapControls";
import { SyncVideoModalMapView } from "@/components/SyncVideoModalMapView";
import { SyncVideoModalVideoControls } from "@/components/SyncVideoModalVideoControls";
import { SyncVideoModalVideoPlayer } from "@/components/SyncVideoModalVideoPlayer";
import { useSyncTelemetryMap } from "@/hooks/useSyncTelemetryMap";
import { useSyncVideoPlayer } from "@/hooks/useSyncVideoPlayer";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";

export type SyncVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SyncVideoModal: FC<SyncVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { backgroundVideoUrl, setVideoStartTimestamp } =
    useBackgroundVideoStore(
      useShallow((s) => ({
        backgroundVideoUrl: s.backgroundVideoUrl,
        setVideoStartTimestamp: s.setVideoStartTimestamp,
      })),
    );

  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);

  const {
    videoRef,
    videoCurrentTime,
    videoDuration,
    videoIsPlaying,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleVideoEnded,
    handleVideoPlay,
    handleVideoPause,
    toggleVideoPlay,
    handleVideoSeek,
    stepFrame,
  } = useSyncVideoPlayer(isOpen);

  const {
    totalElapsed,
    selectedElapsed,
    mapMode,
    setMapMode,
    currentTelemetryPoint,
    routeGeoJson,
    currentPointGeoJson,
    initialBounds,
    mapStyle,
    handleMapClick,
    handleElapsedChange,
  } = useSyncTelemetryMap(isOpen);

  // Compute the absolute timestamp of video frame t=0:
  //   videoCurrentTime is how many seconds into the raw video we are right now,
  //   so t=0 of the video is (gpxPointTime - videoCurrentTime) in real-world time.
  const handleSync = () => {
    if (!currentTelemetryPoint) return;
    const gpxPointTimeMs = currentTelemetryPoint.properties.time.getTime();
    const videoStartTs = new Date(gpxPointTimeMs - videoCurrentTime * 1000);
    setVideoStartTimestamp(videoStartTs);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      classNames={{
        base: "h-[90vh] max-w-[90vw]",
      }}
    >
      <ModalContent className="flex flex-col">
        <ModalHeader className="flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Link2 size={20} />
            Sync video with telemetry
          </div>
          <p className="text-sm font-normal text-foreground/70">
            Align the video and GPX track to synchronize them. Navigate to a
            recognisable moment in both, then press "Sync these points".
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-flow-col grid-cols-[1fr_1px_1fr] grid-rows-[auto_1fr_auto] gap-4 h-full min-h-0">
            {/* ── Video: label ── */}
            <p className="text-sm font-medium text-foreground/70">Video</p>

            {/* ── Video: media ── */}
            <div className="min-h-0">
              <SyncVideoModalVideoPlayer
                videoRef={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onClick={toggleVideoPlay}
              />
            </div>

            {/* ── Video: controls ── */}
            <SyncVideoModalVideoControls
              videoCurrentTime={videoCurrentTime}
              videoDuration={videoDuration}
              videoIsPlaying={videoIsPlaying}
              onSeek={handleVideoSeek}
              onStepFrame={stepFrame}
              onTogglePlay={toggleVideoPlay}
            />

            {/* Divider */}
            <Divider orientation="vertical" className="row-span-3" />

            {/* ── Map: label ── */}
            <p className="text-sm font-medium text-foreground/70">GPX track</p>

            {/* ── Map: media ── */}
            <div className="min-h-0">
              <SyncVideoModalMapView
                routeGeoJson={routeGeoJson}
                currentPointGeoJson={currentPointGeoJson}
                initialBounds={initialBounds}
                mapStyle={mapStyle}
                mapMode={mapMode}
                onMapModeChange={setMapMode}
                onMapClick={handleMapClick}
              />
            </div>

            {/* ── Map: controls ── */}
            <SyncVideoModalMapControls
              totalElapsed={totalElapsed}
              selectedElapsed={selectedElapsed}
              currentTelemetryTime={currentTelemetryPoint?.properties.time}
              onElapsedChange={handleElapsedChange}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSync}
            isDisabled={!backgroundVideoUrl || !telemetryPoints}
          >
            Sync these points
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
