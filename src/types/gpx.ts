/** Complete parsed GPX file */
export type GpxFile = {
  metadata: GpxMetadata;
  tracks: GpxTrack[];
};

/** Metadata extracted from the GPX file */
export type GpxMetadata = {
  name: string | null;
  description: string | null;
  author: string | null;
  time: Date | null;
};

/** A parsed GPX track (one <trk> element) */
export type GpxTrack = {
  name: string | null;
  points: GpxTrackPoint[];
};

/** Raw trackpoint extracted directly from a GPX file */
export type GpxTrackPoint = {
  lat: number;
  lon: number;
  ele: number | null;
  time: Date | null;
  /** Heart rate in bpm (from extensions) */
  hr: number | null;
  /** Cadence in rpm (from extensions) */
  cad: number | null;
  /** Power in watts (from extensions) */
  power: number | null;
  /** Temperature in celsius (from extensions) */
  temp: number | null;
};
