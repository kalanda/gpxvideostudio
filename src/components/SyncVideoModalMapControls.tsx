import { Slider } from "@heroui/react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatPlaybackTime } from "@/utils/format/formatPlaybackTime";

export type SyncVideoModalMapControlsProps = {
  totalElapsed: number;
  selectedElapsed: number;
  currentTelemetryTime: Date | undefined;
  onElapsedChange: (value: number | number[]) => void;
};

export const SyncVideoModalMapControls: FC<SyncVideoModalMapControlsProps> = ({
  totalElapsed,
  selectedElapsed,
  currentTelemetryTime,
  onElapsedChange,
}) => {
  const { t } = useTranslation();
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);

  return (
    <div className="flex flex-col gap-4">
      <Slider
        size="sm"
        step={0.1}
        minValue={0}
        maxValue={Math.max(1, totalElapsed)}
        value={selectedElapsed}
        onChange={onElapsedChange}
        getValue={(v) =>
          formatPlaybackTime(
            typeof v === "number" ? v : ((v as number[])[0] ?? 0),
          )
        }
        isDisabled={!telemetryPoints}
        aria-label={t("syncVideo.telemetryPositionAriaLabel")}
        classNames={{
          value: "text-xs text-foreground/70 font-mono tabular-nums",
          label: "text-xs text-foreground/70",
        }}
      />
      {currentTelemetryTime && (
        <p className="text-xs text-foreground/50 font-mono tabular-nums text-center">
          {t("syncVideo.gpsTimeDisplay", {
            time: currentTelemetryTime.toLocaleString([], {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
          })}
        </p>
      )}
    </div>
  );
};
