import bbox from "@turf/bbox";
import type { Feature, LineString, Point } from "geojson";
import type { MapMouseEvent, StyleSpecification } from "maplibre-gl";
import { useEffect, useState } from "react";
import { MAP_STYLES } from "@/constants/defaults";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { MapTheme } from "@/types/map";
import { interpolateAtTime } from "@/utils/interpolation/interpolateAtTime";

/**
 * Manages telemetry position selection and map display state for the sync modal.
 * Reads telemetryPoints from the telemetry store internally.
 * Resets the selected position whenever the modal opens.
 */
export function useSyncTelemetryMap(isOpen: boolean) {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);

  const [selectedElapsed, setSelectedElapsed] = useState(0);
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map");

  useEffect(() => {
    if (isOpen) {
      setSelectedElapsed(0);
    }
  }, [isOpen]);

  const totalElapsed =
    telemetryPoints && telemetryPoints.features.length > 0
      ? (telemetryPoints.features[telemetryPoints.features.length - 1]
          ?.properties.elapsed ?? 0)
      : 0;

  const currentTelemetryPoint =
    telemetryPoints && telemetryPoints.features.length > 0
      ? interpolateAtTime(telemetryPoints, selectedElapsed, 0, totalElapsed)
      : null;

  const routeGeoJson: Feature<LineString> | null = telemetryPoints
    ? {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: telemetryPoints.features.map(
            (f) => f.geometry.coordinates,
          ),
        },
        properties: {},
      }
    : null;

  const currentPointGeoJson: Feature<Point> | null = currentTelemetryPoint
    ? {
        type: "Feature",
        geometry: currentTelemetryPoint.geometry,
        properties: {},
      }
    : null;

  const rawBounds =
    telemetryPoints && telemetryPoints.features.length >= 2
      ? bbox(telemetryPoints)
      : null;
  const initialBounds = rawBounds
    ? ([rawBounds[0], rawBounds[1], rawBounds[2], rawBounds[3]] as [
        number,
        number,
        number,
        number,
      ])
    : null;

  const mapStyle: string | StyleSpecification =
    mapMode === "satellite"
      ? MAP_STYLES[MapTheme.Satellite]
      : MAP_STYLES[MapTheme.Light];

  const handleMapClick = (e: MapMouseEvent) => {
    if (!telemetryPoints || telemetryPoints.features.length === 0) return;
    const { lng, lat } = e.lngLat;
    let nearestElapsed = 0;
    let minDistSq = Infinity;
    for (const feature of telemetryPoints.features) {
      const [fLon, fLat] = feature.geometry.coordinates;
      const dLon = fLon - lng;
      const dLat = fLat - lat;
      const distSq = dLon * dLon + dLat * dLat;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearestElapsed = feature.properties.elapsed;
      }
    }
    setSelectedElapsed(nearestElapsed);
  };

  const handleElapsedChange = (value: number | number[]) => {
    setSelectedElapsed(typeof value === "number" ? value : (value[0] ?? 0));
  };

  return {
    mapMode,
    mapStyle,
    initialBounds,
    totalElapsed,
    selectedElapsed,
    currentTelemetryPoint,
    routeGeoJson,
    currentPointGeoJson,
    handleMapClick,
    handleElapsedChange,
    setMapMode,
  };
}
