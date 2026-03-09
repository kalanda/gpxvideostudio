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
  /** Full telemetry points for the entire route (drawn as the track line). */
  points: TelemetryFeatureCollection;
  /** Optional: points used only for viewport bounds. When set (e.g. trimmed segment), the map zooms to show this segment so the full "recorrido recortado" is visible. */
  boundsPoints?: TelemetryFeatureCollection | null;
  currentPoint: Feature<Point, TelemetryFrame>;
};

const { viewBoxSize, pad, routeStrokeWidth } = MINIMAP;
/** Arrow size (tip to base in viewBox units) */
const ARROW_R = 5;

export const MiniMap: FC<MiniMapProps> = (props) => {
  const { points, boundsPoints, currentPoint } = props;
  const { primaryColor, accentColor } = useWidgetAppearanceStore();

  const featuresForRoute = points.features.length >= 2 ? points.features : [];

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
  // Use boundsPoints (e.g. trimmed segment) for viewport so the map zooms to the export segment; fallback to full route.
  const pointsForBounds =
    boundsPoints && boundsPoints.features.length >= 2
      ? boundsPoints.features
      : route != null
        ? (route.geometry.coordinates as [number, number][])
        : [];
  const coordsForBounds: [number, number][] =
    pointsForBounds.length > 0
      ? pointsForBounds.map((p) =>
          Array.isArray(p)
            ? (p as [number, number])
            : [p.geometry.coordinates[0], p.geometry.coordinates[1]],
        )
      : [];
  const bounds =
    coordsForBounds.length > 0
      ? bbox(lineString([...coordsForBounds, [cxLon, cxLat]]))
      : null;
  const [minLon, minLat, maxLon, maxLat] = bounds ?? [0, 0, 0, 0];
  const empty =
    featuresForRoute.length === 0 || (maxLon === minLon && maxLat === minLat);

  const inner = viewBoxSize - pad * 2;

  const centerLat = (minLat + maxLat) / 2;
  // Factor de corrección para la longitud (proyección de Mercator aproximada)
  const lonCorrection = Math.cos((centerLat * Math.PI) / 180);

  const widthDeg = (maxLon - minLon) * lonCorrection;
  const heightDeg = maxLat - minLat;

  // Escalar de forma uniforme para mantener la proporción geométrica ("contain")
  const scale = inner / (Math.max(widthDeg, heightDeg) || 1);

  // Centrar el mapa dentro del recuadro
  const xOffset = pad + (inner - widthDeg * scale) / 2;
  const yOffset = pad + (inner - heightDeg * scale) / 2;

  const toX = (longitude: number) => {
    if (empty) return pad + inner / 2;
    return xOffset + (longitude - minLon) * lonCorrection * scale;
  };
  const toY = (latitude: number) => {
    if (empty) return pad + inner / 2;
    return yOffset + (maxLat - latitude) * scale;
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
