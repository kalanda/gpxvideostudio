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
import {
  VIDEO_BITRATE_PRESETS,
  type VideoBitratePresetKey,
  type VideoContainer,
} from "@/constants/defaults";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useExporter } from "@/hooks/useExporter";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useVideoSettingsStore } from "@/stores/videoSettingsStore";
import { calculatePngMemoryUse } from "@/utils/calculations/calculatePngMemoryUse";
import { formatFileWeight } from "@/utils/format/formatFileWeight";
import { formatTime } from "@/utils/format/formatTime";

const VIDEO_BITRATE_LABELS: Record<VideoBitratePresetKey, string> = {
  "very-low": "Very low",
  low: "Low",
  medium: "Medium",
  high: "High",
  "very-high": "Very high",
};

export type ExportVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ExportVideoModal: FC<ExportVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { backgroundVideoUrl } = useBackgroundVideoStore();
  const { fps, width, height } = useVideoSettingsStore();
  const { effectiveDurationSeconds } = useEffectiveExportDuration();
  const {
    isExporting,
    exportProgress,
    startExport,
    cancelExport,
    container,
    videoBitrate,
    setContainer,
    setVideoBitrate,
  } = useExporter();

  const pngEstimatedMemoryUse = calculatePngMemoryUse(
    fps,
    effectiveDurationSeconds,
    width,
    height,
  );

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
            Export options
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Select
              label="Container"
              selectedKeys={[container]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                if (key) setContainer(key as VideoContainer);
              }}
            >
              <SelectItem key="mp4" textValue="Video MP4">
                Video MP4
              </SelectItem>
              <SelectItem
                key="png-sequence"
                textValue="PNG sequence (with transparency)"
              >
                PNG sequence (with transparency)
              </SelectItem>
            </Select>

            {container === "png-sequence" && backgroundVideoUrl && (
              <Alert
                color="primary"
                variant="faded"
                title="Background video will not be included to preserve transparency"
              />
            )}

            {container === "png-sequence" && (
              <Alert
                color="warning"
                variant="faded"
                title={`Recommended: reduce FPS to avoid memory issues. Estimated ${formatFileWeight(pngEstimatedMemoryUse)} for the file.`}
              />
            )}

            {container === "mp4" && (
              <Select
                label="Video bitrate"
                selectedKeys={[videoBitrate]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  if (key) setVideoBitrate(key as VideoBitratePresetKey);
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
              Cancel
            </Button>
            <Button color="primary" onPress={handleAcceptExport}>
              Accept
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isExporting} onClose={cancelExport} isDismissable={false}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Loader2 size={20} className="shrink-0 animate-spin" aria-hidden />
            Exporting
          </ModalHeader>
          <ModalBody className="flex flex-col gap-3">
            <Progress
              showValueLabel={true}
              aria-label="Export progress"
              value={exportProgress.progress}
            />
            <div className="flex flex-col gap-1 text-sm text-foreground/80">
              <p>
                Elapsed time:{" "}
                <strong>{formatTime(exportProgress.elapsedSeconds)}</strong>
              </p>
              {exportProgress.estimatedRemainingSeconds != null && (
                <p>
                  Time remaining (approx.):{" "}
                  <strong>
                    {formatTime(exportProgress.estimatedRemainingSeconds)}
                  </strong>
                </p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={cancelExport}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
