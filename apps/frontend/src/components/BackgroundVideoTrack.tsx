import { Button, useDisclosure } from "@heroui/react";
import {
  FlipHorizontal2,
  FlipVertical2,
  TextCursorInput,
  Trash2,
  Video,
} from "lucide-react";
import type { FC } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { ActionConfirmationModal } from "@/components/ActionConfirmationModal";
import { BackgroundVideoThumbnails } from "@/components/BackgroundVideoThumbnails";
import { MiniCard } from "@/components/MiniCard";
import { SyncVideoModal } from "@/components/SyncVideoModal";
import { VideoTrimSlider } from "@/components/VideoTrimSlider";
import { useVideoDuration } from "@/hooks/useVideoDuration";
import { useVideoUrl } from "@/hooks/useVideoUrl";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";

export const BackgroundVideoTrack: FC = () => {
  const { t } = useTranslation();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen: isSyncModalOpen,
    onOpen: onSyncModalOpen,
    onClose: onSyncModalClose,
  } = useDisclosure();
  const {
    isOpen: isRemoveModalOpen,
    onOpen: onRemoveModalOpen,
    onClose: onRemoveModalClose,
  } = useDisclosure();

  const { backgroundVideoUrl, setFile, clearUrl } = useVideoUrl();
  const {
    backgroundVideoFileName,
    backgroundVideoDurationSeconds,
    flipHorizontal,
    setFlipHorizontal,
    flipVertical,
    setFlipVertical,
  } = useBackgroundVideoStore(
    useShallow((s) => ({
      backgroundVideoFileName: s.backgroundVideoFileName,
      backgroundVideoDurationSeconds: s.backgroundVideoDurationSeconds,
      flipHorizontal: s.flipHorizontal,
      setFlipHorizontal: s.setFlipHorizontal,
      flipVertical: s.flipVertical,
      setFlipVertical: s.setFlipVertical,
    })),
  );

  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const hasBothTracks = !!backgroundVideoUrl && !!telemetryPoints;

  useVideoDuration(backgroundVideoUrl);

  const onVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setFile(file);
  };

  const onConfirmRemove = () => {
    clearUrl();
    onRemoveModalClose();
  };

  const title = backgroundVideoFileName
    ? t("backgroundVideoTrack.titleWithFile", {
        filename: backgroundVideoFileName,
      })
    : t("backgroundVideoTrack.title");

  const actions = (
    <>
      {backgroundVideoUrl ? (
        <>
          {hasBothTracks && (
            <Button
              size="sm"
              variant="flat"
              startContent={<TextCursorInput size={16} />}
              onPress={onSyncModalOpen}
            >
              {t("backgroundVideoTrack.syncWithTelemetry")}
            </Button>
          )}
          <Button
            size="sm"
            variant={flipHorizontal ? "solid" : "flat"}
            onPress={() => setFlipHorizontal(!flipHorizontal)}
            startContent={<FlipHorizontal2 size={16} />}
          >
            {t("backgroundVideoTrack.flipH")}
          </Button>
          <Button
            size="sm"
            variant={flipVertical ? "solid" : "flat"}
            onPress={() => setFlipVertical(!flipVertical)}
            startContent={<FlipVertical2 size={16} />}
          >
            {t("backgroundVideoTrack.flipV")}
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            onPress={onRemoveModalOpen}
            startContent={<Trash2 size={16} />}
          >
            {t("backgroundVideoTrack.remove")}
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
            onPress={() => videoInputRef.current?.click()}
            startContent={<Video size={16} />}
          >
            {t("backgroundVideoTrack.addVideo")}
          </Button>
        </>
      )}
    </>
  );

  return (
    <MiniCard
      title={title}
      titleIcon={<Video size={16} className="shrink-0" />}
      actions={actions}
    >
      {!backgroundVideoUrl && (
        <p className="py-0.5 text-xs text-default-400">
          {t("backgroundVideoTrack.description")}
        </p>
      )}
      <BackgroundVideoThumbnails />
      {backgroundVideoUrl && backgroundVideoDurationSeconds != null && (
        <VideoTrimSlider durationSeconds={backgroundVideoDurationSeconds} />
      )}
      <SyncVideoModal isOpen={isSyncModalOpen} onClose={onSyncModalClose} />
      <ActionConfirmationModal
        isOpen={isRemoveModalOpen}
        title={t("backgroundVideoTrack.removeModalTitle")}
        description={t("backgroundVideoTrack.removeModalDescription")}
        onConfirm={onConfirmRemove}
        onCancel={onRemoveModalClose}
      />
    </MiniCard>
  );
};
