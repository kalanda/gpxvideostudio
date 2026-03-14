import { Button, Slider, useDisclosure } from "@heroui/react";
import { Link2, Trash2, Video } from "lucide-react";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { BackgroundVideoThumbnails } from "@/components/BackgroundVideoThumbnails";
import { MiniCard } from "@/components/MiniCard";
import { SyncVideoModal } from "@/components/SyncVideoModal";
import { useVideoDuration } from "@/hooks/useVideoDuration";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatTime } from "@/utils/format/formatTime";

export const BackgroundVideoTrack: FC = () => {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen: isSyncModalOpen,
    onOpen: onSyncModalOpen,
    onClose: onSyncModalClose,
  } = useDisclosure();
  const {
    backgroundVideoUrl,
    backgroundVideoFileName,
    setBackgroundVideoUrl,
    setBackgroundVideoFileName,
    clearBackgroundVideo,
    backgroundVideoDurationSeconds,
    videoTrimStartSeconds,
    setVideoTrimStartSeconds,
    videoTrimEndSeconds,
    setVideoTrimEndSeconds,
  } = useBackgroundVideoStore();
  const { telemetryPoints } = useTelemetryStore();
  useVideoDuration(backgroundVideoUrl);

  useEffect(() => {
    return () => {
      if (backgroundVideoUrl) URL.revokeObjectURL(backgroundVideoUrl);
    };
  }, [backgroundVideoUrl]);

  useEffect(() => {
    if (
      backgroundVideoDurationSeconds == null ||
      backgroundVideoDurationSeconds <= 0
    )
      return;
    const current = useBackgroundVideoStore.getState().videoTrimEndSeconds;
    setVideoTrimEndSeconds(
      current === 0
        ? backgroundVideoDurationSeconds
        : Math.min(current, backgroundVideoDurationSeconds),
    );
  }, [backgroundVideoDurationSeconds, setVideoTrimEndSeconds]);

  const onVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (backgroundVideoUrl) URL.revokeObjectURL(backgroundVideoUrl);
    setBackgroundVideoFileName(file.name);
    setBackgroundVideoUrl(URL.createObjectURL(file));
  };

  const onAddVideo = () => {
    videoInputRef.current?.click();
  };

  const onRemoveVideo = () => {
    if (backgroundVideoUrl) URL.revokeObjectURL(backgroundVideoUrl);
    clearBackgroundVideo();
  };

  const hasBothTracks = !!backgroundVideoUrl && !!telemetryPoints;

  const actions = (
    <>
      {backgroundVideoUrl ? (
        <>
          {hasBothTracks && (
            <Button
              size="sm"
              variant="flat"
              startContent={<Link2 size={16} />}
              onPress={onSyncModalOpen}
            >
              Sync video with telemetry
            </Button>
          )}
          <Button
            size="sm"
            variant="flat"
            color="danger"
            onPress={onRemoveVideo}
            startContent={<Trash2 size={16} />}
          >
            Remove
          </Button>
        </>
      ) : (
        <>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={onVideoFileChange}
            className="hidden"
            aria-hidden
          />
          <Button
            size="sm"
            variant="bordered"
            onPress={onAddVideo}
            startContent={<Video size={16} />}
          >
            Add video
          </Button>
        </>
      )}
    </>
  );

  const title = backgroundVideoFileName
    ? `Background video track (${backgroundVideoFileName})`
    : "Background video track";

  return (
    <>
      <MiniCard
        title={title}
        titleIcon={<Video size={16} className="shrink-0" />}
        actions={actions}
      >
        <BackgroundVideoThumbnails />
        {backgroundVideoUrl && backgroundVideoDurationSeconds != null && (
          <Slider
            size="sm"
            label="Trim"
            step={1}
            minValue={0}
            maxValue={Math.max(1, Math.floor(backgroundVideoDurationSeconds))}
            value={[
              videoTrimStartSeconds,
              videoTrimEndSeconds > 0
                ? videoTrimEndSeconds
                : backgroundVideoDurationSeconds,
            ]}
            onChange={(v: number | number[]) => {
              const arr = Array.isArray(v) ? v : [v, v];
              const max = Math.max(
                1,
                Math.floor(backgroundVideoDurationSeconds),
              );
              let start = Math.min(arr[0], arr[1]);
              let end = Math.max(arr[0], arr[1]);
              if (end <= start) end = Math.min(start + 1, max);
              start = Math.min(start, end - 1);
              setVideoTrimStartSeconds(start);
              setVideoTrimEndSeconds(end);
            }}
            getValue={(v) =>
              Array.isArray(v)
                ? `${formatTime(v[0])} – ${formatTime(v[1])}`
                : formatTime(v)
            }
            getTooltipValue={(v, index) =>
              formatTime(Array.isArray(v) ? v[index ?? 0] : v)
            }
            showTooltip
            classNames={{
              value: "text-xs text-foreground/80",
              label: "text-foreground/80",
            }}
          />
        )}
      </MiniCard>

      <SyncVideoModal isOpen={isSyncModalOpen} onClose={onSyncModalClose} />
    </>
  );
};
