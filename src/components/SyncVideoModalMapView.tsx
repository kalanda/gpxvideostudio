import { Tab, Tabs } from "@heroui/react";
import type { Feature, LineString, Point } from "geojson";
import type { MapMouseEvent, StyleSpecification } from "maplibre-gl";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Layer, Map as MaplibreMap, Source } from "react-map-gl/maplibre";
import { useTelemetryStore } from "@/stores/telemetryStore";
import "maplibre-gl/dist/maplibre-gl.css";

export type SyncVideoModalMapViewProps = {
  routeGeoJson: Feature<LineString> | null;
  currentPointGeoJson: Feature<Point> | null;
  initialBounds: [number, number, number, number] | null;
  mapStyle: string | StyleSpecification;
  mapMode: "map" | "satellite";
  onMapModeChange: (mode: "map" | "satellite") => void;
  onMapClick: (e: MapMouseEvent) => void;
};

export const SyncVideoModalMapView: FC<SyncVideoModalMapViewProps> = ({
  routeGeoJson,
  currentPointGeoJson,
  initialBounds,
  mapStyle,
  mapMode,
  onMapModeChange,
  onMapClick,
}) => {
  const { t } = useTranslation();
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const hasTelemetry = !!telemetryPoints;

  return (
    <div
      className="relative h-full rounded-medium overflow-hidden"
      style={{ cursor: hasTelemetry ? "crosshair" : "default" }}
    >
      <div className="absolute top-2 right-2 z-10">
        <Tabs
          size="sm"
          selectedKey={mapMode}
          onSelectionChange={(k) => onMapModeChange(k as "map" | "satellite")}
          aria-label={t("syncVideo.mapStyleAriaLabel")}
        >
          <Tab key="map" title={t("syncVideo.mapTab")} />
          <Tab key="satellite" title={t("syncVideo.satelliteTab")} />
        </Tabs>
      </div>
      {hasTelemetry && initialBounds ? (
        <MaplibreMap
          mapStyle={mapStyle}
          initialViewState={{
            bounds: [
              initialBounds[0],
              initialBounds[1],
              initialBounds[2],
              initialBounds[3],
            ],
            fitBoundsOptions: { padding: 40 },
          }}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          onClick={onMapClick}
        >
          {routeGeoJson && (
            <Source id="route" type="geojson" data={routeGeoJson}>
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": "#6366f1",
                  "line-width": 3,
                  "line-opacity": 0.7,
                }}
                layout={{ "line-cap": "round", "line-join": "round" }}
              />
            </Source>
          )}
          {currentPointGeoJson && (
            <Source
              id="current-point"
              type="geojson"
              data={currentPointGeoJson}
            >
              <Layer
                id="current-point-halo"
                type="circle"
                paint={{
                  "circle-radius": 10,
                  "circle-color": "#6366f1",
                  "circle-opacity": 0.3,
                }}
              />
              <Layer
                id="current-point-dot"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#6366f1",
                  "circle-stroke-color": "#ffffff",
                  "circle-stroke-width": 2,
                }}
              />
            </Source>
          )}
        </MaplibreMap>
      ) : (
        <div className="flex h-full items-center justify-center bg-default-100 rounded-medium">
          <p className="text-foreground/40 text-sm">
            {t("syncVideo.noGpxLoaded")}
          </p>
        </div>
      )}
    </div>
  );
};
