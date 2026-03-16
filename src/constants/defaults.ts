import type { StyleSpecification } from "maplibre-gl";
import { RESOLUTION_PRESETS } from "@/constants/presets";
import {
  MapBearingMode,
  MapPitch,
  MapTheme,
  MapViewportMode,
} from "@/types/map";
import { VideoBitrate, VideoContainer } from "@/types/video";

export const DEFAULT_VIDEO_SETTINGS = {
  fps: 30,
  container: VideoContainer.Mp4,
  bitrate: VideoBitrate.VeryHigh,
  width: RESOLUTION_PRESETS["1080p"].width,
  height: RESOLUTION_PRESETS["1080p"].height,
} as const;

export const DEFAULT_OVERLAY_LAYOUT = {
  safeAreaVertical: 5,
  safeAreaHorizontal: 3,
} as const;

export const DEFAULT_EXPORT_FILENAME_PREFIX = "telemetry-overlay";

export const DEFAULT_WIDGET_APPEARANCE = {
  fontFamily: "Roboto",
  primaryColor: "#ffffff",
  accentColor: "#bfd200",
  mapTheme: MapTheme.Dark,
  mapBearingMode: MapBearingMode.Fixed,
  mapViewportMode: MapViewportMode.FollowPoint,
  mapPitch: MapPitch.Tilted,
} as const;

/** ElevationChart SVG: viewBox, strokes and cursor in viewBox units. */
export const ELEVATION_CHART = {
  viewBoxWidth: 500,
  viewBoxHeight: 100,
  pad: 8,
  pathStrokeWidth: 2,
  cursorLineStrokeWidth: 0.5,
  cursorDotRadius: 4,
  minElevationRange: 100, // Enforce a minimum vertical range (in meters) so flat routes don't look steep
  paddingFactor: 0.1, // Add 10% padding top and bottom so the path doesn't touch the SVG edges
} as const;

export const MAP_STYLES: Record<MapTheme, string | StyleSpecification> = {
  [MapTheme.None]: {
    version: 8 as const,
    sources: {},
    layers: [],
  },
  [MapTheme.Light]:
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  [MapTheme.Dark]:
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  [MapTheme.Colored]:
    "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  [MapTheme.Satellite]: {
    version: 8 as const,
    sources: {
      "esri-satellite": {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles &copy; Esri",
      },
    },
    layers: [
      {
        id: "esri-satellite",
        type: "raster" as const,
        source: "esri-satellite",
      },
    ],
  },
} as const;

/** MiniMap: viewBox, padding and path stroke in viewBox units. */
export const MINIMAP = {
  viewBoxSize: 100,
  pad: 8,
  routeStrokeWidth: 1,
  defaultMapTheme: MapTheme.Dark,
  defaultMapBearingMode: MapBearingMode.Fixed,
  defaultMapViewportMode: MapViewportMode.FollowPoint,
  defaultMapPitch: MapPitch.Tilted,
} as const;
