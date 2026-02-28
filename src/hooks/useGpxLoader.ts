import { useCallback, useState } from "react";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { calculateTelemetry } from "@/utils/calculations/calculateTelemetry";
import { smoothSpeeds } from "@/utils/calculations/smoothSpeeds";
import { parseGpx } from "@/utils/gpx-parser/parseGpx";

const SAMPLE_GPX_URL = `${import.meta.env.BASE_URL}sample.gpx`;

export function useGpxLoader() {
  const [gpxError, setGpxError] = useState<string | null>(null);
  const { setGpxTrimStartSeconds, setGpxTrimEndSeconds } =
    useBackgroundVideoStore();
  const { setTelemetryPoints, setGpxFileName } = useTelemetryStore();

  const processGpxString = useCallback(
    (gpxText: string, fileName: string | undefined) => {
      const gpx = parseGpx(gpxText);
      if (gpx.tracks.length === 0) {
        setGpxError("No tracks found in the GPX file");
        return;
      }
      const points = gpx.tracks[0].points;
      if (points.length < 2) {
        setGpxError("The track needs at least 2 points");
        return;
      }
      const hasTime = points.some((p) => p.time !== null);
      if (!hasTime) {
        setGpxError("The track must have timestamps");
        return;
      }
      const nextTelemetryPoints = smoothSpeeds(calculateTelemetry(points), 5);
      setTelemetryPoints(nextTelemetryPoints);
      if (fileName != null) setGpxFileName(fileName);
      setGpxTrimStartSeconds(0);
      setGpxTrimEndSeconds(0);
      setGpxError(null);
    },
    [
      setTelemetryPoints,
      setGpxFileName,
      setGpxTrimStartSeconds,
      setGpxTrimEndSeconds,
    ],
  );

  const loadFromFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".gpx")) {
        setGpxError("Select a .gpx file");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        if (typeof text !== "string") {
          setGpxError("Could not read the file");
          return;
        }
        processGpxString(text, file.name);
      };
      reader.onerror = () => setGpxError("Could not read the file");
      reader.readAsText(file, "UTF-8");
    },
    [processGpxString],
  );

  const loadSample = useCallback(async () => {
    setGpxError(null);
    try {
      const res = await fetch(SAMPLE_GPX_URL);
      if (!res.ok) throw new Error("Could not load the sample GPX file");
      const text = await res.text();
      processGpxString(text, "sample.gpx");
    } catch (err) {
      setGpxError(
        err instanceof Error
          ? err.message
          : "Error loading the sample GPX file",
      );
    }
  }, [processGpxString]);

  const clearError = useCallback(() => setGpxError(null), []);

  return {
    gpxError,
    clearError,
    loadFromFile,
    loadSample,
  };
}
