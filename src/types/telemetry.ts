import type { Feature, FeatureCollection, Point } from "geojson";

/** A trackpoint enriched with calculated telemetry data */
export type TelemetryPoint = {
  /** Index in the original track */
  index: number;
  /** Elevation in meters */
  elevation: number | null;
  /** Timestamp */
  time: Date;
  /** Speed in m/s */
  speed: number;
  /** Cumulative distance from start in meters */
  distance: number;
  /** Slope as a percentage (rise/run * 100) */
  slope: number;
  /** Elapsed time from start in seconds */
  elapsed: number;
  /** Bearing in degrees (0 = North, clockwise, -180..180). Direction of travel. */
  bearing: number;
  /** Heart rate in bpm */
  hr: number | null;
  /** Cadence in rpm */
  cad: number | null;
  /** Power in watts */
  power: number | null;
  /** Temperature in celsius */
  temp: number | null;
};

/** Interpolated telemetry properties for a single frame (no coordinates; use feature geometry) */
export type TelemetryFrame = TelemetryPoint & {
  /** Frame number */
  frame: number;
  /** Progress through track (0 to 1) */
  progress: number;
};

/** Summary statistics for a track */
export type TelemetrySummary = {
  /** Total distance in meters */
  totalDistance: number;
  /** Total duration in seconds */
  totalDuration: number;
  /** Maximum speed in m/s */
  maxSpeed: number;
  /** Average speed in m/s (excluding stops) */
  avgSpeed: number;
  /** Maximum elevation in meters */
  maxElevation: number | null;
  /** Minimum elevation in meters */
  minElevation: number | null;
  /** Total elevation gain in meters */
  elevationGain: number;
  /** Total elevation loss in meters */
  elevationLoss: number;
  /** Number of trackpoints */
  pointCount: number;
};

/** A GeoJSON FeatureCollection of TelemetryPoints */
export type TelemetryFeatureCollection = FeatureCollection<
  Point,
  TelemetryPoint
>;

/** Empty telemetry collection for "no data" state (e.g. preview without GPX) */
export const EMPTY_TELEMETRY: TelemetryFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

/** A GeoJSON Feature for one frame: geometry holds position, properties hold telemetry */
export type TelemetryFrameFeature = Feature<Point, TelemetryFrame>;
