import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataItem } from "@/compositions/widgets/DataItem";
import { formatElevation } from "@/utils/format/formatElevation";
import { formatSlope } from "@/utils/format/formatSlope";
import { formatTemperature } from "@/utils/format/formatTemperature";
import { formatTime } from "@/utils/format/formatTime";

type DataPanelProps = {
  distance: number;
  elapsed: number;
  hr: number | null;
  cad: number | null;
  power: number | null;
  elevation: number | null;
  slope: number;
  temp: number | null;
};

export const DataPanel: FC<DataPanelProps> = (props) => {
  const { t } = useTranslation();
  const { distance, elapsed, hr, cad, power, elevation, slope, temp } = props;
  const { distanceValue, distanceUnit } =
    distance < 1000
      ? { distanceValue: distance.toFixed(0), distanceUnit: "m" }
      : { distanceValue: (distance / 1000).toFixed(2), distanceUnit: "km" };
  return (
    <>
      <DataItem
        label={t("widgets.distance")}
        value={distanceValue}
        unit={distanceUnit}
      />
      <DataItem label={t("widgets.elapsedTime")} value={formatTime(elapsed)} />
      {typeof hr === "number" && (
        <DataItem
          label={t("widgets.heartRate")}
          value={String(Math.round(hr))}
          unit="bpm"
        />
      )}
      {typeof cad === "number" && (
        <DataItem
          label={t("widgets.cadence")}
          value={String(Math.round(cad))}
          unit="rpm"
        />
      )}
      {typeof power === "number" && (
        <DataItem
          label={t("widgets.power")}
          value={String(Math.round(power))}
          unit="W"
        />
      )}

      {typeof slope === "number" && (
        <DataItem
          label={t("widgets.slope")}
          value={formatSlope(slope)}
          unit="%"
        />
      )}
      {typeof elevation === "number" && (
        <DataItem
          label={t("widgets.elevation")}
          value={formatElevation(elevation)}
          unit="m"
        />
      )}
      {typeof temp === "number" && (
        <DataItem
          label={t("widgets.temperature")}
          value={formatTemperature(temp)}
          unit="°C"
        />
      )}
    </>
  );
};
