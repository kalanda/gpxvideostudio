import { Alert, Button, Slider } from "@heroui/react";
import { FileDown, MapPin, Route, Trash2 } from "lucide-react";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { MiniCard } from "@/components/MiniCard";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useGpxLoader } from "@/hooks/useGpxLoader";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import {
  formatDateLocal,
  formatTimeLocal,
} from "@/utils/format/formatDateTimeLocal";

export const TelemetryTrack: FC = () => {
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const {
    gpxTrimStartSeconds,
    setGpxTrimStartSeconds,
    gpxTrimEndSeconds,
    setGpxTrimEndSeconds,
  } = useBackgroundVideoStore();
  const { telemetryPoints, gpxFileName, clearTelemetry } = useTelemetryStore();
  const { gpxDurationSeconds } = useEffectiveExportDuration();
  const { gpxError, loadFromFile, loadSample } = useGpxLoader();

  useEffect(() => {
    if (gpxDurationSeconds <= 0) return;
    const current = useBackgroundVideoStore.getState().gpxTrimEndSeconds;
    setGpxTrimEndSeconds(
      current === 0
        ? gpxDurationSeconds
        : Math.min(current, gpxDurationSeconds),
    );
  }, [gpxDurationSeconds, setGpxTrimEndSeconds]);

  useEffect(() => {
    if (
      telemetryPoints &&
      gpxDurationSeconds > 0 &&
      gpxTrimStartSeconds >= gpxDurationSeconds
    ) {
      setGpxTrimStartSeconds(Math.max(0, Math.floor(gpxDurationSeconds) - 1));
    }
  }, [
    telemetryPoints,
    gpxDurationSeconds,
    gpxTrimStartSeconds,
    setGpxTrimStartSeconds,
  ]);

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
          onPress={clearTelemetry}
          startContent={<Trash2 size={16} />}
        >
          Remove
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
            Load sample
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onPress={() => gpxInputRef.current?.click()}
            startContent={<MapPin size={16} />}
          >
            Add .GPX
          </Button>
        </>
      )}
    </>
  );

  const title = gpxFileName
    ? `Telemetry track (${gpxFileName})`
    : "Telemetry track";

  return (
    <MiniCard
      title={title}
      titleIcon={<Route size={16} className="shrink-0" />}
      actions={actions}
    >
      {gpxError && <Alert color="danger" variant="flat" title={gpxError} />}
      {telemetryPoints &&
        (() => {
          const gpxStartTime = telemetryPoints.features[0].properties.time;
          const formatElapsedAsDateTime = (elapsedSeconds: number) => {
            const date = new Date(
              gpxStartTime.getTime() + elapsedSeconds * 1000,
            );
            return `${formatDateLocal(date)} ${formatTimeLocal(date)}`;
          };
          return (
            <Slider
              size="sm"
              label="Trim"
              step={1}
              minValue={0}
              maxValue={Math.max(1, Math.floor(gpxDurationSeconds))}
              value={[
                gpxTrimStartSeconds,
                gpxTrimEndSeconds > 0 ? gpxTrimEndSeconds : gpxDurationSeconds,
              ]}
              onChange={(v: number | number[]) => {
                const arr = Array.isArray(v) ? v : [v, v];
                const max = Math.max(1, Math.floor(gpxDurationSeconds));
                let start = Math.min(arr[0], arr[1]);
                let end = Math.max(arr[0], arr[1]);
                if (end <= start) end = Math.min(start + 1, max);
                start = Math.min(start, end - 1);
                setGpxTrimStartSeconds(start);
                setGpxTrimEndSeconds(end);
              }}
              getValue={(v) =>
                Array.isArray(v)
                  ? `${formatElapsedAsDateTime(v[0])} – ${formatElapsedAsDateTime(v[1])}`
                  : formatElapsedAsDateTime(v)
              }
              getTooltipValue={(v, index) =>
                formatElapsedAsDateTime(Array.isArray(v) ? v[index ?? 0] : v)
              }
              showTooltip
              classNames={{
                value: "text-xs text-foreground/80",
                label: "text-foreground/80",
              }}
            />
          );
        })()}
    </MiniCard>
  );
};
