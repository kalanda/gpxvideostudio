import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { calculateTelemetry } from "@/utils/calculations/calculateTelemetry";
import { parseGpx } from "@/utils/gpx-parser/parseGpx";

const SAMPLE_GPX_URL = `${import.meta.env.BASE_URL}sample.gpx`;

export function useGpxLoader() {
  const [gpxError, setGpxError] = useState<string | null>(null);
  const { setTelemetryPoints, setGpxFileName, setGpxTrimEndSeconds } =
    useTelemetryStore(
      useShallow((s) => ({
        setTelemetryPoints: s.setTelemetryPoints,
        setGpxFileName: s.setGpxFileName,
        setGpxTrimEndSeconds: s.setGpxTrimEndSeconds,
      })),
    );

  function processGpxString(gpxText: string, fileName: string | undefined) {
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
    const telemetryPoints = calculateTelemetry(points);

    setTelemetryPoints(telemetryPoints);
    if (fileName != null) setGpxFileName(fileName);
    setGpxTrimEndSeconds(0);
    // A new GPX invalidates the previous sync — reset it so the user syncs again.
    useBackgroundVideoStore.getState().setVideoStartTimestamp(null);
    setGpxError(null);
  }

  function loadFromFile(file: File) {
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
  }

  async function loadSample() {
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
  }

  function clearError() {
    setGpxError(null);
  }

  return {
    gpxError,
    clearError,
    loadFromFile,
    loadSample,
  };
}
