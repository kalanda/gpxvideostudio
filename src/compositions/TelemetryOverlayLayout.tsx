import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DataPanel } from "@/compositions/widgets/DataPanel";
import { DateTimeDisplay } from "@/compositions/widgets/DateTimeDisplay";
import { ElevationChart } from "@/compositions/widgets/ElevationChart";
import { MiniMap } from "@/compositions/widgets/MiniMap";
import { SpeedGauge } from "@/compositions/widgets/SpeedGauge";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useTrimmedTelemetryPoints } from "@/hooks/useTrimmedTelemetryPoints";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { calculateSummary } from "@/utils/calculations/calculateSummary";
import { getFrameData } from "@/utils/interpolation/getFrameData";
import { LayoutWrapper } from "./LayoutWrapper";

export const TelemetryOverlayLayout: FC = () => {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const trimmedPoints = useTrimmedTelemetryPoints();
  const { gpxTrimStartSeconds } = useBackgroundVideoStore();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { effectiveDurationSeconds } = useEffectiveExportDuration();

  const data = getFrameData(telemetryPoints, frame, fps, gpxTrimStartSeconds);
  const summary = calculateSummary(trimmedPoints);

  if (!telemetryPoints || !data) return null;

  const progressInSegment =
    effectiveDurationSeconds > 0
      ? Math.min(
          1,
          Math.max(
            0,
            (data.properties.elapsed - gpxTrimStartSeconds) /
              effectiveDurationSeconds,
          ),
        )
      : 0;

  return (
    <AbsoluteFill>
      <LayoutWrapper>
        <div className="absolute top-0 left-0">
          <DateTimeDisplay date={data.properties.time} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96">
          <MiniMap
            points={trimmedPoints ?? telemetryPoints}
            currentPoint={data}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="flex items-end justify-between gap-20">
            <SpeedGauge
              speed={data.properties.speed}
              maxSpeed={summary.maxSpeed}
            />
            <ElevationChart
              elevations={(trimmedPoints ?? telemetryPoints).features.map(
                (p) => p.properties.elevation,
              )}
              progress={progressInSegment}
            />
            <div className="flex flex-col items-center justify-center gap-8 shrink-0">
              <DataPanel
                distance={data.properties.distance}
                elapsed={data.properties.elapsed}
                hr={data.properties.hr}
                cad={data.properties.cad}
                power={data.properties.power}
                elevation={data.properties.elevation}
                slope={data.properties.slope}
              />
            </div>
          </div>
        </div>
      </LayoutWrapper>
    </AbsoluteFill>
  );
};
