import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import type { FC } from "react";
import { MINIMAP } from "@/constants/defaults";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import type {
  TelemetryFeatureCollection,
  TelemetryFrame,
} from "@/types/telemetry";

type MiniMapProps = {
  /** Telemetry points for the route (already trimmed by trim config; no filtering here). */
  points: TelemetryFeatureCollection;
  currentPoint: Feature<Point, TelemetryFrame>;
};

const { viewBoxSize, pad, routeStrokeWidth } = MINIMAP;
/** Arrow size (tip to base in viewBox units) */
const ARROW_R = 5;

export const MiniMap: FC<MiniMapProps> = (props) => {
  const { points, currentPoint } = props;
  const { primaryColor, accentColor } = useWidgetAppearanceStore();

  const featuresForRoute =
    points.features.length >= 2 ? points.features : [];

  const route =
    featuresForRoute.length > 0
      ? lineString(
          featuresForRoute.map((p) => [
            p.geometry.coordinates[0],
            p.geometry.coordinates[1],
          ]),
        )
      : null;

  const [cxLon, cxLat] = currentPoint.geometry.coordinates;
  const bounds =
    route != null
      ? bbox(
          lineString([
            ...(route.geometry.coordinates as [number, number][]),
            [cxLon, cxLat],
          ]),
        )
      : null;
  const [minLon, minLat, maxLon, maxLat] = bounds ?? [0, 0, 0, 0];
  const empty =
    featuresForRoute.length === 0 || (maxLon === minLon && maxLat === minLat);

  const inner = viewBoxSize - pad * 2;

  const toX = (longitude: number) => {
    if (empty || maxLon === minLon) return pad + inner / 2;
    return pad + ((longitude - minLon) / (maxLon - minLon)) * inner;
  };
  const toY = (latitude: number) => {
    if (empty || maxLat === minLat) return pad + inner / 2;
    return pad + ((maxLat - latitude) / (maxLat - minLat)) * inner;
  };

  const coords = route?.geometry.coordinates ?? [];
  const pathD = coords
    .map(
      (coord, i) => `${i === 0 ? "M" : "L"} ${toX(coord[0])} ${toY(coord[1])}`,
    )
    .join(" ");

  const cx = toX(currentPoint.geometry.coordinates[0]);
  const cy = toY(currentPoint.geometry.coordinates[1]);

  const bearingDeg = currentPoint.properties.bearing ?? 0;
  // Bearing is unwrapped (may be outside -180..180). Normalize to [0, 360) for SVG rotate.
  const rotation = ((bearingDeg % 360) + 360) % 360;
  const arrowPath = `M ${cx} ${cy - ARROW_R} L ${cx - ARROW_R * 0.7} ${cy + ARROW_R * 0.6} L ${cx} ${cy + ARROW_R * 0.25} L ${cx + ARROW_R * 0.7} ${cy + ARROW_R * 0.6} Z`;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Route map with current position"
    >
      <path
        d={pathD}
        fill="none"
        stroke={primaryColor}
        strokeWidth={routeStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={arrowPath}
        fill={accentColor}
        strokeWidth={1}
        transform={`rotate(${rotation} ${cx} ${cy})`}
        aria-hidden
      />
    </svg>
  );
};
