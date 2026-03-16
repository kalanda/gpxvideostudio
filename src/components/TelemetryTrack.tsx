import { Alert, Button, Slider } from "@heroui/react";
import { FileDown, MapPin, Route, Trash2 } from "lucide-react";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { MiniCard } from "@/components/MiniCard";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useGpxLoader } from "@/hooks/useGpxLoader";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatElapsedAsDateTimeLocal } from "@/utils/format/formatElapsedAsDateTimeLocal";

export const TelemetryTrack: FC = () => {
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const {
    telemetryPoints,
    gpxFileName,
    clearTelemetry,
    gpxTrimStartSeconds,
    setGpxTrimStartSeconds,
    gpxTrimEndSeconds,
    setGpxTrimEndSeconds,
  } = useTelemetryStore(
    useShallow((s) => ({
      telemetryPoints: s.telemetryPoints,
      gpxFileName: s.gpxFileName,
      clearTelemetry: s.clearTelemetry,
      gpxTrimStartSeconds: s.gpxTrimStartSeconds,
      setGpxTrimStartSeconds: s.setGpxTrimStartSeconds,
      gpxTrimEndSeconds: s.gpxTrimEndSeconds,
      setGpxTrimEndSeconds: s.setGpxTrimEndSeconds,
    })),
  );
  const { gpxDurationSeconds } = useEffectiveExportDuration();
  const { gpxError, loadFromFile, loadSample } = useGpxLoader();

  // Auto-initialise gpxTrimEndSeconds to the full track length when the GPX is first loaded.
  useEffect(() => {
    if (gpxDurationSeconds <= 0) return;
    const current = useTelemetryStore.getState().gpxTrimEndSeconds;
    setGpxTrimEndSeconds(
      current === 0
        ? gpxDurationSeconds
        : Math.min(current, gpxDurationSeconds),
    );
  }, [gpxDurationSeconds, setGpxTrimEndSeconds]);

  // Clamp gpxTrimStart if the track shrinks (e.g. new file loaded).
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
      {!telemetryPoints && !gpxError && (
        <p className="py-0.5 text-xs text-default-400">
          Load a GPX file to add speed, distance, elevation and route map data
          to your video.
        </p>
      )}
      {telemetryPoints &&
        (() => {
          const gpxStartTime = telemetryPoints.features[0].properties.time;
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
                  ? `${formatElapsedAsDateTimeLocal(v[0], gpxStartTime)} – ${formatElapsedAsDateTimeLocal(v[1], gpxStartTime)}`
                  : formatElapsedAsDateTimeLocal(v, gpxStartTime)
              }
              getTooltipValue={(v, index) =>
                formatElapsedAsDateTimeLocal(
                  Array.isArray(v) ? v[index ?? 0] : v,
                  gpxStartTime,
                )
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
