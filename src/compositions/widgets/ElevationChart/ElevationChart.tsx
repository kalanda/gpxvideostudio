import type { FC } from "react";
import { ELEVATION_CHART } from "@/constants/defaults";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";

type ElevationChartProps = {
  elevations: Array<number | null>;
  /** Progress through the track (0 to 1) */
  progress: number;
};

const {
  viewBoxWidth,
  viewBoxHeight,
  pad,
  pathStrokeWidth,
  cursorLineStrokeWidth,
  cursorDotRadius,
} = ELEVATION_CHART;

export const ElevationChart: FC<ElevationChartProps> = (props) => {
  const { elevations, progress } = props;
  const { primaryColor, accentColor } = useWidgetAppearanceStore();

  const validElevations = elevations.filter((e): e is number => e !== null);

  const minEle = elevations.length > 0 ? Math.min(...validElevations) : 0;
  const maxEle = elevations.length > 0 ? Math.max(...validElevations) : 100;
  const range = maxEle - minEle || 1;
  const innerW = viewBoxWidth - pad * 2;
  const innerH = viewBoxHeight - pad * 2;

  const toX = (i: number) =>
    pad + (i / Math.max(1, elevations.length - 1)) * innerW;
  const toY = (ele: number | null) => {
    if (ele === null) return pad + innerH / 2;
    return pad + innerH - ((ele - minEle) / range) * innerH;
  };

  const pathD = elevations
    .map((e, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(e)}`)
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
          x1={cursorX}
          y1={pad}
          x2={cursorX}
          y2={pad + innerH}
          stroke={primaryColor}
          strokeOpacity={0.5}
          strokeWidth={cursorLineStrokeWidth}
        />
        {/* Cursor dot on the line */}
        {elevations.length > 0 && (
          <circle
            cx={cursorX}
            cy={toY(
              elevations[
                Math.min(
                  Math.floor(progress * elevations.length),
                  elevations.length - 1,
                )
              ],
            )}
            r={cursorDotRadius}
            fill={accentColor}
          />
        )}
      </svg>
    </div>
  );
};
