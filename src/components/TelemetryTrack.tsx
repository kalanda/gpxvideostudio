import { Alert, Button, useDisclosure } from "@heroui/react";
import { FileDown, MapPin, Route, Trash2 } from "lucide-react";
import type { FC } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { ActionConfirmationModal } from "@/components/ActionConfirmationModal";
import { MiniCard } from "@/components/MiniCard";
import { useGpxLoader } from "@/hooks/useGpxLoader";
import { useTelemetryStore } from "@/stores/telemetryStore";

export const TelemetryTrack: FC = () => {
  const { t } = useTranslation();
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen: isRemoveModalOpen,
    onOpen: onRemoveModalOpen,
    onClose: onRemoveModalClose,
  } = useDisclosure();
  const { telemetryPoints, gpxFileName, clearTelemetry } = useTelemetryStore(
    useShallow((s) => ({
      telemetryPoints: s.telemetryPoints,
      gpxFileName: s.gpxFileName,
      clearTelemetry: s.clearTelemetry,
    })),
  );
  const { gpxError, loadFromFile, loadSample } = useGpxLoader();

  const onGpxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void loadFromFile(file);
  };

  const actions = (
    <>
      {telemetryPoints ? (
        <Button
          size="sm"
          variant="flat"
          color="danger"
          onPress={onRemoveModalOpen}
          startContent={<Trash2 size={16} />}
        >
          {t("telemetryTrack.remove")}
        </Button>
      ) : (
        <>
          <input
            ref={gpxInputRef}
            type="file"
            accept=".gpx"
            onChange={onGpxFileChange}
            className="hidden"
            aria-hidden
          />
          <Button
            size="sm"
            variant="flat"
            onPress={loadSample}
            startContent={<FileDown size={16} />}
          >
            {t("telemetryTrack.loadSample")}
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onPress={() => gpxInputRef.current?.click()}
            startContent={<MapPin size={16} />}
          >
            {t("telemetryTrack.addGpx")}
          </Button>
        </>
      )}
    </>
  );

  const title = gpxFileName
    ? t("telemetryTrack.titleWithFile", { filename: gpxFileName })
    : t("telemetryTrack.title");

  return (
    <MiniCard
      title={title}
      titleIcon={<Route size={16} className="shrink-0" />}
      actions={actions}
    >
      {gpxError && <Alert color="danger" variant="flat" title={gpxError} />}
      {!telemetryPoints && !gpxError && (
        <p className="py-0.5 text-xs text-default-400">
          {t("telemetryTrack.description")}
        </p>
      )}
      <ActionConfirmationModal
        isOpen={isRemoveModalOpen}
        title={t("telemetryTrack.removeModalTitle")}
        description={t("telemetryTrack.removeModalDescription")}
        onConfirm={() => {
          clearTelemetry();
          onRemoveModalClose();
        }}
        onCancel={onRemoveModalClose}
      />
    </MiniCard>
  );
};
