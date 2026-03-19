import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Select,
  SelectItem,
} from "@heroui/react";
import { FileOutput, Loader2 } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { VIDEO_BITRATE_PRESETS } from "@/constants/presets";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useExporter } from "@/hooks/useExporter";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { VideoBitrate, type VideoContainer } from "@/types/video";
import { calculatePngMemoryUse } from "@/utils/calculations/calculatePngMemoryUse";
import { formatFileWeight } from "@/utils/format/formatFileWeight";
import { formatTime } from "@/utils/format/formatTime";

export type ExportVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ExportVideoModal: FC<ExportVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const backgroundVideoUrl = useBackgroundVideoStore(
    (s) => s.backgroundVideoUrl,
  );
  const { fps, width, height, container, bitrate, setContainer, setBitrate } =
    useProjectVideoSettingsStore(
      useShallow((s) => ({
        fps: s.fps,
        width: s.width,
        height: s.height,
        container: s.container,
        bitrate: s.bitrate,
        setContainer: s.setContainer,
        setBitrate: s.setBitrate,
      })),
    );
  const { effectiveDurationSeconds } = useEffectiveExportDuration();
  const { isExporting, exportProgress, startExport, cancelExport } =
    useExporter();

  const pngEstimatedMemoryUse = calculatePngMemoryUse(
    fps,
    effectiveDurationSeconds,
    width,
    height,
  );

  const VIDEO_BITRATE_LABELS: Record<VideoBitrate, string> = {
    [VideoBitrate.VeryLow]: t("export.bitrates.veryLow"),
    [VideoBitrate.Low]: t("export.bitrates.low"),
    [VideoBitrate.Medium]: t("export.bitrates.medium"),
    [VideoBitrate.High]: t("export.bitrates.high"),
    [VideoBitrate.VeryHigh]: t("export.bitrates.veryHigh"),
  };

  const handleAcceptExport = () => {
    onClose();
    startExport();
  };

  return (
    <>
      <Modal isOpen={isOpen && !isExporting} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FileOutput size={20} className="shrink-0" />
            {t("export.title")}
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Select
              label={t("export.containerLabel")}
              selectedKeys={[container]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                if (key) setContainer(key as VideoContainer);
              }}
            >
              <SelectItem key="mp4" textValue={t("export.containerMp4")}>
                {t("export.containerMp4")}
              </SelectItem>
              <SelectItem
                key="png-sequence"
                textValue={t("export.containerPng")}
              >
                {t("export.containerPng")}
              </SelectItem>
            </Select>

            {container === "png-sequence" && backgroundVideoUrl && (
              <Alert
                color="primary"
                variant="faded"
                title={t("export.alertNoVideo")}
              />
            )}

            {container === "png-sequence" && (
              <Alert
                color="warning"
                variant="faded"
                title={t("export.alertMemory", {
                  size: formatFileWeight(pngEstimatedMemoryUse),
                })}
              />
            )}

            {container === "mp4" && (
              <Select
                label={t("export.bitrateLabel")}
                selectedKeys={[bitrate]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  if (key) setBitrate(key as VideoBitrate);
                }}
              >
                {VIDEO_BITRATE_PRESETS.map((key) => (
                  <SelectItem key={key} textValue={VIDEO_BITRATE_LABELS[key]}>
                    {VIDEO_BITRATE_LABELS[key]}
                  </SelectItem>
                ))}
              </Select>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              {t("export.cancel")}
            </Button>
            <Button color="primary" onPress={handleAcceptExport}>
              {t("export.accept")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isExporting} onClose={cancelExport} isDismissable={false}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Loader2 size={20} className="shrink-0 animate-spin" aria-hidden />
            {t("export.exportingTitle")}
          </ModalHeader>
          <ModalBody className="flex flex-col gap-3">
            <Progress
              showValueLabel={true}
              aria-label={t("export.exportingTitle")}
              value={exportProgress.progress}
            />
            <div className="flex flex-col gap-1 text-sm text-foreground/80">
              <p>
                {t("export.elapsedTime")}{" "}
                <strong>{formatTime(exportProgress.elapsedSeconds)}</strong>
              </p>
              {exportProgress.estimatedRemainingSeconds != null && (
                <p>
                  {t("export.timeRemaining")}{" "}
                  <strong>
                    {formatTime(exportProgress.estimatedRemainingSeconds)}
                  </strong>
                </p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={cancelExport}>
              {t("export.cancel")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
