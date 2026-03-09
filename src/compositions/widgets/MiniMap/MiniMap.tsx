import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import type { FC } from "react";
import { MINIMAP, SVG_PATH_PRECISION } from "@/constants/defaults";
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

export const MiniMap: FC<MiniMapProps> = (props) => {
  const { points, boundsPoints, currentPoint } = props;
  const { primaryColor, accentColor } = useWidgetAppearanceStore();

  const activePoints =
    boundsPoints && boundsPoints.features.length >= 2 ? boundsPoints : points;

  const featuresForRoute =
    activePoints.features.length >= 2 ? activePoints.features : [];

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
      (coord, i) =>
        `${i === 0 ? "M" : "L"} ${toX(coord[0]).toFixed(SVG_PATH_PRECISION)} ${toY(coord[1]).toFixed(SVG_PATH_PRECISION)}`,
    )
    .join(" ");

  const cx = toX(currentPoint.geometry.coordinates[0]);
  const cy = toY(currentPoint.geometry.coordinates[1]);

  const bearingDeg = currentPoint.properties.bearing ?? 0;
  // Bearing is unwrapped (may be outside -180..180). Normalize to [0, 360) for SVG rotate.
  const rotation = ((bearingDeg % 360) + 360) % 360;

  const startPoint = featuresForRoute.length > 0 ? featuresForRoute[0] : null;
  const endPoint =
    featuresForRoute.length > 0
      ? featuresForRoute[featuresForRoute.length - 1]
      : null;

  const startCx = startPoint ? toX(startPoint.geometry.coordinates[0]) : null;
  const startCy = startPoint ? toY(startPoint.geometry.coordinates[1]) : null;
  const endCx = endPoint ? toX(endPoint.geometry.coordinates[0]) : null;
  const endCy = endPoint ? toY(endPoint.geometry.coordinates[1]) : null;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Route map with current position"
    >
      <defs>
        <path
          id="minimap-arrow"
          d="M 0 -2.80 L -2.44 2.80 L 0 1.575 L 2.44 2.80 Z"
        />
        <circle
          id="minimap-start-circle"
          cx={0}
          cy={0}
          r={routeStrokeWidth * 1.5}
        />
        <circle
          id="minimap-end-circle"
          cx={0}
          cy={0}
          r={routeStrokeWidth * 1.5}
        />
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke={primaryColor}
        strokeWidth={routeStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {startCx !== null && startCy !== null && (
        <use
          href="#minimap-start-circle"
          transform={`translate(${startCx.toFixed(SVG_PATH_PRECISION)} ${startCy.toFixed(SVG_PATH_PRECISION)})`}
          fill={primaryColor}
        />
      )}
      {endCx !== null && endCy !== null && (
        <use
          href="#minimap-end-circle"
          transform={`translate(${endCx.toFixed(SVG_PATH_PRECISION)} ${endCy.toFixed(SVG_PATH_PRECISION)})`}
          fill={primaryColor}
        />
      )}
      <use
        href="#minimap-arrow"
        fill={accentColor}
        transform={`translate(${cx.toFixed(SVG_PATH_PRECISION)} ${cy.toFixed(SVG_PATH_PRECISION)}) rotate(${rotation.toFixed(SVG_PATH_PRECISION)})`}
        aria-hidden
      />
    </svg>
  );
};
