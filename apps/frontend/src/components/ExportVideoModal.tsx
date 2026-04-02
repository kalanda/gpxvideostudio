import {
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
import { useExporter } from "@/hooks/useExporter";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { VideoBitrate } from "@/types/video";
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
  const { bitrate, setBitrate } = useProjectVideoSettingsStore(
    useShallow((s) => ({
      bitrate: s.bitrate,
      setBitrate: s.setBitrate,
    })),
  );
  const { isExporting, exportProgress, startExport, cancelExport } =
    useExporter();

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
