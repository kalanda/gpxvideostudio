import { renderMediaOnWeb } from "@remotion/web-renderer";
import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { REMOTION_WEB_RENDERER_LICENSE_KEY } from "@/constants/config";
import { DEFAULT_EXPORT_FILENAME_PREFIX } from "@/constants/defaults";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useExportProgress } from "@/hooks/useExportProgress";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { downloadBlob } from "@/utils/browser/downloadBlob";
import { buildExportArtifactBasename } from "@/utils/export/buildExportArtifactBasename";
import { getTelemetryOverlayComposition } from "@/utils/export/getTelemetryOverlayComposition";

export function useExporter() {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const { fps, width, height, bitrate } = useProjectVideoSettingsStore(
    useShallow((s) => ({
      fps: s.fps,
      width: s.width,
      height: s.height,
      bitrate: s.bitrate,
    })),
  );
  const { durationInFrames: effectiveDurationInFrames } =
    useEffectiveExportDuration();

  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  const { exportProgress, initProgress, updateProgress, resetProgress } =
    useExportProgress();
  const wakeLock = useWakeLock();

  const canExport = telemetryPoints && !isExporting;

  const startExport = async () => {
    if (!telemetryPoints) {
      setError("No telemetry points found.");
      setIsExporting(false);
      return;
    }
    abortController.current = new AbortController();
    setIsExporting(true);
    setError(null);

    await wakeLock.acquire();

    const filenamePrefix = buildExportArtifactBasename(
      DEFAULT_EXPORT_FILENAME_PREFIX,
      new Date(),
    );
    const totalFrames = effectiveDurationInFrames;
    const signal = abortController.current.signal;

    initProgress(totalFrames);

    try {
      const composition = getTelemetryOverlayComposition({
        durationInFrames: totalFrames,
        fps,
        width,
        height,
      });
      const { getBlob } = await renderMediaOnWeb({
        licenseKey: REMOTION_WEB_RENDERER_LICENSE_KEY,
        composition,
        inputProps: { hideBackgroundVideo: false },
        container: "mp4",
        transparent: false,
        videoBitrate: bitrate,
        onProgress: (p) => {
          updateProgress(p.renderedFrames, totalFrames);
        },
        signal,
      });
      const blob = await getBlob();
      downloadBlob(blob, `${filenamePrefix}.mp4`);
      setIsExporting(false);
    } catch (err) {
      const isCancelled =
        err instanceof Error && err.message?.includes("was cancelled");
      if (isCancelled) {
        setIsExporting(false);
        return;
      }
      console.error(err);
      setError(err instanceof Error ? err.message : "Export failed.");
      setIsExporting(false);
    } finally {
      wakeLock.release();
    }
  };

  const cancelExport = () => {
    abortController.current?.abort();
    wakeLock.release();
    resetProgress();
    setIsExporting(false);
    setError(null);
  };

  return {
    error,
    isExporting,
    canExport,
    exportProgress,
    startExport,
    cancelExport,
  };
}
