import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import { DataItem } from "@/compositions/widgets/DataItem";
import { SVG_PATH_PRECISION } from "@/constants/config";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import { formatSpeed } from "@/utils/format/formatSpeed";

type SpeedGaugeProps = {
  /** Speed in m/s */
  speed: number;
  /** Max speed in m/s for scale (needle at 100% when speed >= maxSpeed) */
  maxSpeed: number;
};

/** ViewBox size; SVG scales to fill container (container should be square for correct aspect). */
const VIEWBOX_SIZE = 100;
const NEEDLE_ANGLE_MIN = -180; // left side (0 km/h)
const NEEDLE_ANGLE_MAX = 135; // right side (max)

export const SpeedGauge: FC<SpeedGaugeProps> = (props) => {
  const { speed, maxSpeed } = props;
  const { accentColor, primaryColor } = useWidgetAppearanceStore(
    useShallow((s) => ({
      accentColor: s.accentColor,
      primaryColor: s.primaryColor,
    })),
  );
  const effectiveMax = Math.max(maxSpeed, 1);
  const t = Math.min(1, Math.max(0, speed / effectiveMax));
  const angle = NEEDLE_ANGLE_MIN + t * (NEEDLE_ANGLE_MAX - NEEDLE_ANGLE_MIN);

  const r = VIEWBOX_SIZE / 2;
  const cx = r;
  const cy = r;
  const strokeWidth = 8;
  const trackR = r - strokeWidth / 2;

  // Arc from left to right (270° span)
  const startAngle = (NEEDLE_ANGLE_MIN * Math.PI) / 180;
  const endAngle = (NEEDLE_ANGLE_MAX * Math.PI) / 180;
  const x1 = cx + trackR * Math.cos(startAngle);
  const y1 = cy + trackR * Math.sin(startAngle);
  const x2 = cx + trackR * Math.cos(endAngle);
  const y2 = cy + trackR * Math.sin(endAngle);
  const largeArc = 1;
  const arcD = `M ${x1.toFixed(SVG_PATH_PRECISION)} ${y1.toFixed(SVG_PATH_PRECISION)} A ${trackR.toFixed(SVG_PATH_PRECISION)} ${trackR.toFixed(SVG_PATH_PRECISION)} 0 ${largeArc} 1 ${x2.toFixed(SVG_PATH_PRECISION)} ${y2.toFixed(SVG_PATH_PRECISION)}`;
  const arcLength =
    (trackR * (NEEDLE_ANGLE_MAX - NEEDLE_ANGLE_MIN) * Math.PI) / 180;

  const needleLength = trackR - 12;
  const needleEndX = cx + needleLength * Math.cos((angle * Math.PI) / 180);
  const needleEndY = cy + needleLength * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="w-48 h-48">
        <svg
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Speed gauge: ${formatSpeed(speed)} km/h`}
        >
          {/* Background arc track */}
          <path
            d={arcD}
            fill="none"
            stroke={primaryColor}
            strokeOpacity={0.2}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={arcD}
            fill="none"
            stroke={accentColor}
            strokeOpacity={0.9}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength * (1 - t)}
          />
          {/* Needle */}
          <line
            x1={cx.toFixed(SVG_PATH_PRECISION)}
            y1={cy.toFixed(SVG_PATH_PRECISION)}
            x2={needleEndX.toFixed(SVG_PATH_PRECISION)}
            y2={needleEndY.toFixed(SVG_PATH_PRECISION)}
            stroke={primaryColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle
            cx={cx.toFixed(SVG_PATH_PRECISION)}
            cy={cy.toFixed(SVG_PATH_PRECISION)}
            r={4}
            fill={primaryColor}
          />
        </svg>
      </div>
      <DataItem value={formatSpeed(speed)} unit="km/h" />
    </div>
  );
};
