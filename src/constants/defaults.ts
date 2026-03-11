/** Remotion web-renderer videoBitrate presets */
export const VIDEO_BITRATE_PRESETS = [
  "very-low",
  "low",
  "medium",
  "high",
  "very-high",
] as const;

export type VideoBitratePresetKey = (typeof VIDEO_BITRATE_PRESETS)[number];

export type VideoContainer = "mp4" | "png-sequence";

export const DEFAULT_VIDEO_SETTINGS = {
  fps: 30,
  container: "mp4",
  videoBitrate: "very-high" as VideoBitratePresetKey,
  width: 1920,
  height: 1080,
} as const;

/** Common video resolution presets: 4K, 2K, Full HD, HD */
export const RESOLUTION_PRESETS = {
  "4k": { width: 3840, height: 2160 },
  "2k": { width: 2560, height: 1440 },
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
} as const;

export type ResolutionPresetKey = keyof typeof RESOLUTION_PRESETS;

export const WIDTH_HEIGHT_MIN = 720;
export const WIDTH_HEIGHT_MAX = 4096;

export const FPS_MIN = 1;
export const FPS_MAX = 60;

/** Reference resolution for overlay layout (landscape); content is designed at this size and scaled to fit. */
export const OVERLAY_REFERENCE_WIDTH = 1920;
export const OVERLAY_REFERENCE_HEIGHT = 1080;

export const DEFAULT_OVERLAY_LAYOUT = {
  safeAreaVertical: 5,
  safeAreaHorizontal: 3,
} as const;

export const DEFAULT_EXPORT_FILENAME_PREFIX = "telemetry-overlay";

/** Subset of Google Fonts shown by default (legible, versatile). Use the "Show all" option to search the full catalog. */
export const PRESET_FONT_FAMILIES = [
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Poppins",
  "Oswald",
  "Raleway",
  "Playfair Display",
  "Lora",
  "Work Sans",
] as const;

/** Map base layer theme (MiniMap). */
export enum MapTheme {
  None = "none",
  Light = "light",
  Dark = "dark",
  Colored = "colored",
}

/** MiniMap: north-up vs rotate with route direction. */
export enum MapBearingMode {
  Fixed = "fixed",
  Dynamic = "dynamic",
}

/** MiniMap: show full route in frame vs follow current point. */
export enum MapViewportMode {
  FullRoute = "full-route",
  FollowPoint = "follow-point",
}

/** MiniMap: camera tilt in degrees. */
export enum MapPitch {
  TopDown = 0,
  Tilted = 60,
}

/** Numeric values of MapPitch for iteration (Object.values includes keys in numeric enums). */
export const MAP_PITCH_VALUES: MapPitch[] = [MapPitch.TopDown, MapPitch.Tilted];

export const DEFAULT_WIDGET_APPEARANCE = {
  fontFamily: "Roboto",
  primaryColor: "#ffffff",
  accentColor: "#B0BC00",
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

export const MAP_THEMES_BASEMAP_URLS: Record<MapTheme, string | null> = {
  [MapTheme.None]: null,
  [MapTheme.Light]:
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  [MapTheme.Dark]:
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  [MapTheme.Colored]:
    "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
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

/** Number of decimals for SVG paths to optimize rendering */
export const SVG_PATH_PRECISION = 2;
