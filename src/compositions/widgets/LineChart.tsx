import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import { SVG_PATH_PRECISION } from "@/constants/config";
import { LINE_CHART } from "@/constants/defaults";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";

type LineChartProps = {
  label: string;
  data: Array<number | null>;
  elapsedTimes: number[];
  /** Current frame elapsed time (seconds), same scale as `elapsedTimes`. */
  currentElapsed: number;
};

const {
  viewBoxWidth,
  viewBoxHeight,
  pad,
  pathStrokeWidth,
  cursorLineStrokeWidth,
  cursorDotRadius,
  minDataRange,
  paddingFactor,
} = LINE_CHART;

export const LineChart: FC<LineChartProps> = (props) => {
  const { label, data, elapsedTimes, currentElapsed } = props;
  const { primaryColor, accentColor } = useWidgetAppearanceStore(
    useShallow((s) => ({
      primaryColor: s.primaryColor,
      accentColor: s.accentColor,
    })),
  );

  const validData = data.filter((e): e is number => e !== null);

  const actualMinData = validData.length > 0 ? Math.min(...validData) : 0;
  const actualMaxData = validData.length > 0 ? Math.max(...validData) : 100;
  const actualRange = actualMaxData - actualMinData;

  let displayMinData = actualMinData;
  let displayMaxData = actualMaxData;

  if (actualRange < minDataRange) {
    const center = (actualMaxData + actualMinData) / 2;
    displayMinData = center - minDataRange / 2;
    displayMaxData = center + minDataRange / 2;
  } else {
    const padding = actualRange * paddingFactor;
    displayMinData -= padding;
    displayMaxData += padding;
  }

  const range = displayMaxData - displayMinData || 1;
  const innerW = viewBoxWidth - pad * 2;
  const innerH = viewBoxHeight - pad * 2;

  const tMin = elapsedTimes.length > 0 ? Math.min(...elapsedTimes) : 0;
  const tMax = elapsedTimes.length > 0 ? Math.max(...elapsedTimes) : 0;
  const timeSpan = tMax - tMin;

  const progressNorm =
    timeSpan > 0
      ? Math.min(1, Math.max(0, (currentElapsed - tMin) / timeSpan))
      : 0;

  // X position from elapsed time within the trimmed series; index-based if no time span.
  const toX = (i: number) => {
    if (timeSpan <= 0) {
      return pad + (i / Math.max(1, data.length - 1)) * innerW;
    }
    const t = Math.max(0, Math.min(1, (elapsedTimes[i] - tMin) / timeSpan));
    return pad + t * innerW;
  };
  const toY = (ele: number | null) => {
    if (ele === null) return pad + innerH / 2;
    return pad + innerH - ((ele - displayMinData) / range) * innerH;
  };

  const pathD = data
    .map(
      (e, i) =>
        `${i === 0 ? "M" : "L"} ${toX(i).toFixed(SVG_PATH_PRECISION)} ${toY(e).toFixed(SVG_PATH_PRECISION)}`,
    )
    .join(" ");

  const cursorX = pad + progressNorm * innerW;

  return (
    <div className="h-50">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
      >
        {/* Path */}
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
        {data.length > 0 &&
          (() => {
            // Binary search for the lower-bound index
            let lo = 0;
            let hi = elapsedTimes.length - 1;
            while (lo < hi - 1) {
              const mid = (lo + hi) >> 1;
              if ((elapsedTimes[mid] ?? 0) <= currentElapsed) lo = mid;
              else hi = mid;
            }
            const hiIdx = Math.min(lo + 1, data.length - 1);
            const span = (elapsedTimes[hiIdx] ?? 0) - (elapsedTimes[lo] ?? 0);
            const t =
              span > 0 ? (currentElapsed - (elapsedTimes[lo] ?? 0)) / span : 0;
            const e0 = data[lo];
            const e1 = data[hiIdx];
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
