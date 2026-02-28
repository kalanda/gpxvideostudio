import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { parseGpx } from "./parseGpx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sampleGpx = readFileSync(
  join(__dirname, "fixtures/sample.gpx"),
  "utf-8",
);

describe("parseGpx", () => {
  test("parses metadata correctly", () => {
    const result = parseGpx(sampleGpx);

    expect(result.metadata.name).toBe("Test Ride");
    expect(result.metadata.description).toBe("A test cycling route");
    expect(result.metadata.author).toBe("Test Author");
    expect(result.metadata.time).toEqual(new Date("2024-07-15T10:00:00Z"));
  });

  test("parses tracks", () => {
    const result = parseGpx(sampleGpx);

    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].name).toBe("Morning Ride");
  });

  test("parses trackpoints with coordinates and elevation", () => {
    const result = parseGpx(sampleGpx);
    const points = result.tracks[0].points;

    expect(points).toHaveLength(5);

    expect(points[0].lat).toBe(43.3623);
    expect(points[0].lon).toBe(-8.4115);
    expect(points[0].ele).toBe(100.0);
    expect(points[0].time).toEqual(new Date("2024-07-15T10:00:00Z"));
  });

  test("parses extension data (hr, cad)", () => {
    const result = parseGpx(sampleGpx);
    const points = result.tracks[0].points;

    expect(points[0].hr).toBe(120);
    expect(points[0].cad).toBe(80);
    expect(points[2].hr).toBe(130);
    expect(points[2].cad).toBe(85);
  });

  test("handles null extensions gracefully", () => {
    const gpx = `<?xml version="1.0"?>
      <gpx version="1.1">
        <trk><trkseg>
          <trkpt lat="43.0" lon="-8.0">
            <ele>100</ele>
            <time>2024-01-01T00:00:00Z</time>
          </trkpt>
        </trkseg></trk>
      </gpx>`;

    const result = parseGpx(gpx);
    const point = result.tracks[0].points[0];

    expect(point.hr).toBeNull();
    expect(point.cad).toBeNull();
    expect(point.power).toBeNull();
    expect(point.temp).toBeNull();
  });

  test("skips trackpoints with invalid coordinates", () => {
    const gpx = `<?xml version="1.0"?>
      <gpx version="1.1">
        <trk><trkseg>
          <trkpt lat="invalid" lon="-8.0">
            <ele>100</ele>
          </trkpt>
          <trkpt lat="43.0" lon="-8.0">
            <ele>100</ele>
          </trkpt>
        </trkseg></trk>
      </gpx>`;

    const result = parseGpx(gpx);
    expect(result.tracks[0].points).toHaveLength(1);
  });

  test("handles GPX with no metadata", () => {
    const gpx = `<?xml version="1.0"?>
      <gpx version="1.1">
        <trk><trkseg>
          <trkpt lat="43.0" lon="-8.0">
            <ele>100</ele>
            <time>2024-01-01T00:00:00Z</time>
          </trkpt>
        </trkseg></trk>
      </gpx>`;

    const result = parseGpx(gpx);
    expect(result.metadata.name).toBeNull();
    expect(result.metadata.description).toBeNull();
    expect(result.metadata.author).toBeNull();
    expect(result.metadata.time).toBeNull();
  });

  test("handles multiple tracks", () => {
    const gpx = `<?xml version="1.0"?>
      <gpx version="1.1">
        <trk>
          <name>Track 1</name>
          <trkseg>
            <trkpt lat="43.0" lon="-8.0"><ele>100</ele><time>2024-01-01T00:00:00Z</time></trkpt>
          </trkseg>
        </trk>
        <trk>
          <name>Track 2</name>
          <trkseg>
            <trkpt lat="44.0" lon="-9.0"><ele>200</ele><time>2024-01-01T01:00:00Z</time></trkpt>
          </trkseg>
        </trk>
      </gpx>`;

    const result = parseGpx(gpx);
    expect(result.tracks).toHaveLength(2);
    expect(result.tracks[0].name).toBe("Track 1");
    expect(result.tracks[1].name).toBe("Track 2");
  });

  test("handles trackpoints without elevation", () => {
    const gpx = `<?xml version="1.0"?>
      <gpx version="1.1">
        <trk><trkseg>
          <trkpt lat="43.0" lon="-8.0">
            <time>2024-01-01T00:00:00Z</time>
          </trkpt>
        </trkseg></trk>
      </gpx>`;

    const result = parseGpx(gpx);
    expect(result.tracks[0].points[0].ele).toBeNull();
  });
});
