import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import { SVG_PATH_PRECISION } from "@/constants/config";
import { ELEVATION_CHART } from "@/constants/defaults";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";

type ElevationChartProps = {
  elevations: Array<number | null>;
  /** Elapsed time (seconds) for each elevation sample, 1:1 with the elevations array. */
  elapsedTimes: number[];
  /** Elapsed time (seconds) at the start of the export segment. */
  segmentStartElapsed: number;
  /** Duration (seconds) of the export segment. */
  segmentDuration: number;
  /** Progress through the segment (0 to 1), derived from elapsed time. */
  progress: number;
};

const {
  viewBoxWidth,
  viewBoxHeight,
  pad,
  pathStrokeWidth,
  cursorLineStrokeWidth,
  cursorDotRadius,
  minElevationRange,
  paddingFactor,
} = ELEVATION_CHART;

export const ElevationChart: FC<ElevationChartProps> = (props) => {
  const {
    elevations,
    elapsedTimes,
    segmentStartElapsed,
    segmentDuration,
    progress,
  } = props;
  const { primaryColor, accentColor } = useWidgetAppearanceStore(
    useShallow((s) => ({
      primaryColor: s.primaryColor,
      accentColor: s.accentColor,
    })),
  );

  const validElevations = elevations.filter((e): e is number => e !== null);

  const actualMinEle =
    validElevations.length > 0 ? Math.min(...validElevations) : 0;
  const actualMaxEle =
    validElevations.length > 0 ? Math.max(...validElevations) : 100;
  const actualRange = actualMaxEle - actualMinEle;

  let displayMinEle = actualMinEle;
  let displayMaxEle = actualMaxEle;

  if (actualRange < minElevationRange) {
    const center = (actualMaxEle + actualMinEle) / 2;
    displayMinEle = center - minElevationRange / 2;
    displayMaxEle = center + minElevationRange / 2;
  } else {
    const padding = actualRange * paddingFactor;
    displayMinEle -= padding;
    displayMaxEle += padding;
  }

  const range = displayMaxEle - displayMinEle || 1;
  const innerW = viewBoxWidth - pad * 2;
  const innerH = viewBoxHeight - pad * 2;

  // X position derived from elapsed time so it uses the same scale as `progress`.
  // Falls back to index-based if segmentDuration is zero.
  const toX = (i: number) => {
    if (segmentDuration <= 0) {
      return pad + (i / Math.max(1, elevations.length - 1)) * innerW;
    }
    const t = Math.max(
      0,
      Math.min(1, (elapsedTimes[i] - segmentStartElapsed) / segmentDuration),
    );
    return pad + t * innerW;
  };
  const toY = (ele: number | null) => {
    if (ele === null) return pad + innerH / 2;
    return pad + innerH - ((ele - displayMinEle) / range) * innerH;
  };

  const pathD = elevations
    .map(
      (e, i) =>
        `${i === 0 ? "M" : "L"} ${toX(i).toFixed(SVG_PATH_PRECISION)} ${toY(e).toFixed(SVG_PATH_PRECISION)}`,
    )
    .join(" ");

  const cursorX = pad + progress * innerW;

  return (
    <div className="h-50">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Elevation profile at ${Math.round(progress * 100)}% of route`}
      >
        {/* Elevation path */}
        <path
          d={pathD}
          fill="none"
          stroke={primaryColor}
          strokeOpacity={0.8}
          strokeWidth={pathStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cursor line */}
        <line
          x1={cursorX.toFixed(SVG_PATH_PRECISION)}
          y1={pad.toFixed(SVG_PATH_PRECISION)}
          x2={cursorX.toFixed(SVG_PATH_PRECISION)}
          y2={(pad + innerH).toFixed(SVG_PATH_PRECISION)}
          stroke={primaryColor}
          strokeOpacity={0.5}
          strokeWidth={cursorLineStrokeWidth}
        />
        {/* Cursor dot — Y interpolated between the two surrounding elapsed-time points */}
        {elevations.length > 0 &&
          (() => {
            const currentElapsed =
              segmentStartElapsed + progress * segmentDuration;
            // Binary search for the lower-bound index
            let lo = 0;
            let hi = elapsedTimes.length - 1;
            while (lo < hi - 1) {
              const mid = (lo + hi) >> 1;
              if ((elapsedTimes[mid] ?? 0) <= currentElapsed) lo = mid;
              else hi = mid;
            }
            const hiIdx = Math.min(lo + 1, elevations.length - 1);
            const span = (elapsedTimes[hiIdx] ?? 0) - (elapsedTimes[lo] ?? 0);
            const t =
              span > 0 ? (currentElapsed - (elapsedTimes[lo] ?? 0)) / span : 0;
            const e0 = elevations[lo];
            const e1 = elevations[hiIdx];
            const dotEle =
              e0 !== null && e1 !== null
                ? e0 + t * (e1 - e0)
                : (e0 ?? e1 ?? null);
            return (
              <circle
                cx={cursorX.toFixed(SVG_PATH_PRECISION)}
                cy={toY(dotEle).toFixed(SVG_PATH_PRECISION)}
                r={cursorDotRadius}
                fill={accentColor}
              />
            );
          })()}
      </svg>
    </div>
  );
};
