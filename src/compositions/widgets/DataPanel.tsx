import type { FC } from "react";
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
  const { distance, elapsed, hr, cad, power, elevation, slope, temp } = props;
  const { distanceValue, distanceUnit } =
    distance < 1000
      ? { distanceValue: distance.toFixed(0), distanceUnit: "m" }
      : { distanceValue: (distance / 1000).toFixed(2), distanceUnit: "km" };
  return (
    <>
      <DataItem label="Distance" value={distanceValue} unit={distanceUnit} />
      <DataItem label="Elapsed Time" value={formatTime(elapsed)} />
      {typeof hr === "number" && (
        <DataItem
          label="Heart Rate"
          value={String(Math.round(hr))}
          unit="bpm"
        />
      )}
      {typeof cad === "number" && (
        <DataItem label="Cadence" value={String(Math.round(cad))} unit="rpm" />
      )}
      {typeof power === "number" && (
        <DataItem label="Power" value={String(Math.round(power))} unit="W" />
      )}

      {typeof slope === "number" && (
        <DataItem label="Slope" value={formatSlope(slope)} unit="%" />
      )}
      {typeof elevation === "number" && (
        <DataItem
          label="Elevation"
          value={formatElevation(elevation)}
          unit="m"
        />
      )}
      {typeof temp === "number" && (
        <DataItem
          label="Temperature"
          value={formatTemperature(temp)}
          unit="°C"
        />
      )}
    </>
  );
};
