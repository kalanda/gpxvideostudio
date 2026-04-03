import { t } from "i18next";
import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { LayoutWrapper } from "@/compositions/LayoutWrapper";
import { Gauge } from "@/compositions/widgets/Gauge";
import { LineChart } from "@/compositions/widgets/LineChart";
import { MiniMap } from "@/compositions/widgets/MiniMap";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useTrimmedTelemetryPoints } from "@/hooks/useTrimmedTelemetryPoints";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { calculateSummary } from "@/utils/calculations/calculateSummary";
import { formatDateLocal } from "@/utils/format/formatDateLocal";
import { formatElevation } from "@/utils/format/formatElevation";
import { formatSlope } from "@/utils/format/formatSlope";
import { formatSpeed } from "@/utils/format/formatSpeed";
import { formatTemperature } from "@/utils/format/formatTemperature";
import { formatTime } from "@/utils/format/formatTime";
import { formatTimeLocal } from "@/utils/format/formatTimeLocal";
import { getFrameData } from "@/utils/interpolation/getFrameData";
import { DataItem } from "./widgets/DataItem";

export const TelemetryOverlayLayout: FC = () => {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const trimmedPoints = useTrimmedTelemetryPoints();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { gpxElapsedAtExportStart } = useEffectiveExportDuration();

  const data = getFrameData(
    telemetryPoints,
    frame,
    fps,
    gpxElapsedAtExportStart,
  );
  const summary = calculateSummary(trimmedPoints);

  const { distanceValue, distanceUnit } =
    summary.totalDistance < 1000
      ? { distanceValue: summary.totalDistance.toFixed(0), distanceUnit: "m" }
      : {
          distanceValue: (summary.totalDistance / 1000).toFixed(2),
          distanceUnit: "km",
        };

  if (!telemetryPoints || !trimmedPoints || !data) {
    return null;
  }

  return (
    <AbsoluteFill>
      <LayoutWrapper>
        <div className="absolute top-0 left-0">
          <DataItem
            label={formatDateLocal(data.properties.time)}
            value={formatTimeLocal(data.properties.time)}
          />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96">
          <MiniMap
            points={telemetryPoints}
            boundsPoints={trimmedPoints}
            currentPoint={data}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="flex items-end justify-between gap-20">
            <Gauge
              label={t("telemetryValues.speed")}
              value={data.properties.speed}
              formattedValue={formatSpeed(data.properties.speed)}
              unit="km/h"
              maxValue={summary.maxSpeed}
            />
            <LineChart
              label={t("telemetryValues.elevation")}
              data={trimmedPoints.features.map((p) => p.properties.elevation)}
              elapsedTimes={trimmedPoints.features.map(
                (p) => p.properties.elapsed,
              )}
              currentElapsed={data.properties.elapsed}
            />
            <div className="flex flex-col items-center justify-center gap-6 shrink-0 w-64">
              <DataItem
                label={t("telemetryValues.distance")}
                value={distanceValue}
                unit={distanceUnit}
              />
              <DataItem
                label={t("telemetryValues.elapsedTime")}
                value={formatTime(data.properties.elapsed)}
              />
              {typeof data.properties.hr === "number" && (
                <DataItem
                  label={t("telemetryValues.heartRate")}
                  value={String(Math.round(data.properties.hr))}
                  unit="bpm"
                />
              )}
              {typeof data.properties.cad === "number" && (
                <DataItem
                  label={t("telemetryValues.cadence")}
                  value={String(Math.round(data.properties.cad))}
                  unit="rpm"
                />
              )}
              {typeof data.properties.power === "number" && (
                <DataItem
                  label={t("telemetryValues.power")}
                  value={String(Math.round(data.properties.power))}
                  unit="W"
                />
              )}

              {typeof data.properties.slope === "number" && (
                <DataItem
                  label={t("telemetryValues.slope")}
                  value={formatSlope(data.properties.slope)}
                  unit="%"
                />
              )}
              {typeof data.properties.elevation === "number" && (
                <DataItem
                  label={t("telemetryValues.elevation")}
                  value={formatElevation(data.properties.elevation)}
                  unit="m"
                />
              )}
              {typeof data.properties.temp === "number" && (
                <DataItem
                  label={t("telemetryValues.temperature")}
                  value={formatTemperature(data.properties.temp)}
                  unit="°C"
                />
              )}
            </div>
          </div>
        </div>
      </LayoutWrapper>
    </AbsoluteFill>
  );
};
