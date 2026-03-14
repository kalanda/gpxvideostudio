import { MapView } from "@deck.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import { DeckGL } from "@deck.gl/react";
import Color from "colorjs.io";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Map as MapboxMap } from "react-map-gl/maplibre";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import {
  MapBearingMode,
  MapPitch,
  MapTheme,
  MapViewportMode,
} from "@/types/map";
import type {
  TelemetryFeatureCollection,
  TelemetryFrame,
} from "@/types/telemetry";
import "maplibre-gl/dist/maplibre-gl.css";
import clsx from "clsx";
import type { Feature, Point } from "geojson";
import maplibregl from "maplibre-gl";
import {
  DEFAULT_WIDGET_APPEARANCE,
  MAP_THEMES_BASEMAP_URLS,
} from "@/constants/defaults";

type MiniMapProps = {
  /** Full telemetry points for the entire route (drawn as the track line). */
  points: TelemetryFeatureCollection;
  /** Optional: points used only for viewport bounds. When set (e.g. trimmed segment), the map zooms to show this segment so the full trimmed route is visible. */
  boundsPoints?: TelemetryFeatureCollection | null;
  currentPoint: Feature<Point, TelemetryFrame>;
};

export const MiniMap: FC<MiniMapProps> = (props) => {
  const { points, boundsPoints, currentPoint } = props;
  const {
    primaryColor,
    accentColor,
    mapTheme,
    mapBearingMode,
    mapViewportMode,
    mapPitch,
  } = useWidgetAppearanceStore();

  const activePoints =
    boundsPoints && boundsPoints.features.length >= 2 ? boundsPoints : points;

  const featuresForRoute =
    activePoints.features.length >= 2 ? activePoints.features : [];

  const routeCoords = featuresForRoute.map((p) => [
    p.geometry.coordinates[0],
    p.geometry.coordinates[1],
  ]);

  const [cxLon, cxLat] = currentPoint.geometry.coordinates;

  const bearingDeg = currentPoint.properties.bearing ?? 0;

  // Get Remotion frame state for animating map movement
  const frame = useCurrentFrame();

  // Extract timestamps for TripsLayer from the `time` field
  const timestamps = featuresForRoute.map((f) => {
    if (f.properties?.time) {
      const date =
        f.properties.time instanceof Date
          ? f.properties.time
          : new Date(f.properties.time as unknown as string);
      return date.getTime() / 1000;
    }
    return 0;
  });

  // Normalize timestamps if we have real data, otherwise use index
  let routeTimestamps: number[] = [];
  const hasRealTimestamps = timestamps.length > 0 && timestamps[0] !== 0;

  if (hasRealTimestamps) {
    const startTime = timestamps[0];
    routeTimestamps = timestamps.map((t) => t - startTime);
  } else {
    // Fake timestamps based on index, scaled to frames roughly
    routeTimestamps = featuresForRoute.map((_, i) => i * 0.2);
  }

  // Current time for the TripsLayer
  const currentTimestamp = hasRealTimestamps
    ? currentPoint.properties.time
      ? (currentPoint.properties.time instanceof Date
          ? currentPoint.properties.time
          : new Date(currentPoint.properties.time as unknown as string)
        ).getTime() /
          1000 -
        timestamps[0]
      : routeTimestamps[
          Math.floor((frame / 2) % Math.max(1, routeTimestamps.length))
        ]
    : routeTimestamps[
        Math.floor((frame / 2) % Math.max(1, routeTimestamps.length))
      ];

  // Parse accent color with Color.js → sRGB [R,G,B,A] 0-255 for Deck.gl (reliable across formats and color spaces)
  const accentRgb = ((): [number, number, number, number] => {
    const raw = accentColor ?? DEFAULT_WIDGET_APPEARANCE.accentColor;
    try {
      const c =
        Color.try(raw) ?? new Color(DEFAULT_WIDGET_APPEARANCE.accentColor);
      const srgb = c.to("srgb");
      const [r, g, b] = srgb.coords;
      const a = srgb.alpha ?? 1;
      return [
        Math.round(Number(r) * 255),
        Math.round(Number(g) * 255),
        Math.round(Number(b) * 255),
        Math.round(Number(a) * 255),
      ];
    } catch {
      const fallback = new Color(DEFAULT_WIDGET_APPEARANCE.accentColor).to(
        "srgb",
      );
      const [r, g, b] = fallback.coords;
      return [
        Math.round(Number(r) * 255),
        Math.round(Number(g) * 255),
        Math.round(Number(b) * 255),
        255,
      ];
    }
  })();
  const getAccentColor = () =>
    [...accentRgb] as [number, number, number, number];

  // Make sure current route coordinates are complete
  const isReady = routeCoords.length >= 2;

  // Background PathLayer (shows the full route faintly)
  const pathLayer = new PathLayer({
    id: "route-path",
    data: isReady ? [{ path: routeCoords }] : [],
    // biome-ignore lint/suspicious/noExplicitAny: Deck.gl requires generic any for internal data format
    getPath: (d: any) => d.path as [number, number][],
    getColor: getAccentColor,
    opacity: 0.3, // Opacity instead of alpha in color
    getWidth: 5,
    widthMinPixels: 4,
    capRounded: true,
    jointRounded: true,
    parameters: {
      depthTest: false, // Draw above the terrain always
    },
  });

  // Create a marker layer for the current position since Map libre markers sometimes don't render perfectly in Remotion
  const markerLayer = new ScatterplotLayer({
    id: "route-marker",
    data: [{ position: [cxLon, cxLat] }],
    // biome-ignore lint/suspicious/noExplicitAny: Deck.gl requires generic any for internal data format
    getPosition: (d: any) => d.position,
    getFillColor: getAccentColor,
    getLineColor: () => [255, 255, 255, 255],
    getLineWidth: 2,
    getRadius: 8,
    radiusUnits: "pixels",
    lineWidthUnits: "pixels",
    stroked: true,
    parameters: {
      depthTest: false, // Draw above everything
    },
  });
  // TripsLayer to show the "following the star" glowing effect
  const tripsLayer = new TripsLayer({
    id: "route-trips",
    data: isReady
      ? [
          {
            path: routeCoords,
            timestamps: routeTimestamps,
          },
        ]
      : [],
    // biome-ignore lint/suspicious/noExplicitAny: Deck.gl requires generic any for internal data format
    getPath: (d: any) => d.path,
    // biome-ignore lint/suspicious/noExplicitAny: Deck.gl requires generic any for internal data format
    getTimestamps: (d: any) => d.timestamps,
    getColor: getAccentColor,
    opacity: 1,
    widthMinPixels: 6,
    capRounded: true,
    jointRounded: true,
    fadeTrail: true,
    trailLength: hasRealTimestamps
      ? 180
      : Math.max(10, routeCoords.length * 0.15),
    currentTime: currentTimestamp,
    parameters: {
      depthTest: false, // Draw above the terrain always
    },
  });

  // Calculate Map bounds to frame the route properly
  let routeZoom = 14;
  let routeCenterLon = cxLon;
  let routeCenterLat = cxLat;

  if (activePoints.features.length > 0) {
    const lons = activePoints.features.map((f) => f.geometry.coordinates[0]);
    const lats = activePoints.features.map((f) => f.geometry.coordinates[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    routeCenterLon = (minLon + maxLon) / 2;
    routeCenterLat = (minLat + maxLat) / 2;

    // A simple zoom approximation based on the bounding box size
    const lonDiff = maxLon - minLon;
    const latDiff = maxLat - minLat;
    const maxDiff = Math.max(lonDiff, latDiff);
    if (maxDiff > 0) {
      // 360 degrees of longitude fits in zoom level 0. -0.5 for padding.
      routeZoom = Math.min(16, Math.max(0, Math.log2(360 / maxDiff) - 0.5));
    }
  }

  const isFollowMode = mapViewportMode === MapViewportMode.FollowPoint;
  const computedZoom = isFollowMode ? Math.min(16, routeZoom + 1.5) : routeZoom;
  const computedLon = isFollowMode ? cxLon : routeCenterLon;
  const computedLat = isFollowMode ? cxLat : routeCenterLat;
  const computedBearing =
    mapBearingMode === MapBearingMode.Dynamic ? bearingDeg : 0;

  // Shared view state — used by both MapLibre and DeckGL so they stay in sync
  const viewState = {
    longitude: computedLon,
    latitude: computedLat,
    zoom: computedZoom,
    pitch:
      mapPitch === MapPitch.TopDown
        ? 0
        : mapPitch === MapPitch.Tilted
          ? 60
          : undefined,
    bearing: computedBearing,
  };

  const [mapLoaded, setMapLoaded] = useState(false);

  const delayHandleRef = useRef<number | null>(null);
  const renderedFrameRef = useRef<number>(-1);

  // delayRender for every new frame so Remotion waits for both canvases
  if (renderedFrameRef.current !== frame && delayHandleRef.current === null) {
    try {
      delayHandleRef.current = delayRender(`MiniMap frame ${frame}`);
    } catch (_e) {
      // Not in Remotion context (e.g. Storybook, dev preview)
    }
  }

  const releaseFrame = useCallback(() => {
    if (delayHandleRef.current !== null) {
      try {
        continueRender(delayHandleRef.current);
      } catch (_e) {}
      delayHandleRef.current = null;
      renderedFrameRef.current = frame;
    }
  }, [frame]);

  function onMapLoad() {
    setMapLoaded(true);
  }

  // When DeckGL finishes a render pass AND the base map is ready, wait two
  // animation frames (GPU flush) before telling Remotion to capture.
  function onDeckAfterRender() {
    if (delayHandleRef.current !== null && mapLoaded) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          releaseFrame();
        });
      });
    }
  }

  // After the base map loads for the first time, give DeckGL a moment to
  // composite its layers, then release.
  useEffect(() => {
    if (mapLoaded && delayHandleRef.current !== null) {
      const t = setTimeout(() => releaseFrame(), 250);
      return () => clearTimeout(t);
    }
  }, [mapLoaded, releaseFrame]);

  // Safety-net: never block Remotion longer than 5 s per frame
  useEffect(() => {
    const timeout = setTimeout(() => releaseFrame(), 5000);
    return () => clearTimeout(timeout);
  }, [releaseFrame]);

  const mapStyleUrl = MAP_THEMES_BASEMAP_URLS[mapTheme];

  return (
    <div
      className={clsx("w-full h-full relative rounded-small overflow-hidden", {
        "bg-background-50 border-1 shadow-md": mapTheme === MapTheme.Light,
        "bg-background-900 border-1 shadow-md": mapTheme === MapTheme.Dark,
      })}
      style={{
        borderColor: primaryColor,
      }}
    >
      {/* Base map — rendered first (bottom layer) */}
      {mapStyleUrl && (
        <MapboxMap
          mapLib={maplibregl}
          mapStyle={mapStyleUrl}
          interactive={false}
          attributionControl={false}
          onLoad={onMapLoad}
          onError={onMapLoad}
          maxPitch={85}
          {...viewState}
          style={{ position: "absolute", inset: 0 }}
        />
      )}

      {/* DeckGL overlay — separate canvas on top with transparent background */}
      <DeckGL
        views={new MapView({ repeat: true })}
        viewState={viewState}
        controller={false}
        layers={[pathLayer, tripsLayer, markerLayer]}
        useDevicePixels={false}
        onAfterRender={onDeckAfterRender}
        getCursor={() => "inherit"}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
