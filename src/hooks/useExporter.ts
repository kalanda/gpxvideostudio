import { renderMediaOnWeb, renderStillOnWeb } from "@remotion/web-renderer";
import { format } from "date-fns";
import JSZip from "jszip";
import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { MainComposition } from "@/compositions/MainComposition";
import { DEFAULT_EXPORT_FILENAME_PREFIX } from "@/constants/defaults";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useExportProgress } from "@/hooks/useExportProgress";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { downloadBlob } from "@/utils/browser/downloadBlob";

export function useExporter() {
  const telemetryPoints = useTelemetryStore((s) => s.telemetryPoints);
  const { fps, width, height, container, bitrate } =
    useProjectVideoSettingsStore(
      useShallow((s) => ({
        fps: s.fps,
        width: s.width,
        height: s.height,
        container: s.container,
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

  async function exportAsVideo(
    totalFrames: number,
    signal: AbortSignal,
  ): Promise<Blob> {
    const videoContainer = container === "png-sequence" ? "mp4" : container;
    const { getBlob } = await renderMediaOnWeb({
      licenseKey: "free-license",
      composition: {
        id: "telemetry-overlay",
        component: MainComposition,
        durationInFrames: totalFrames,
        fps,
        width,
        height,
        defaultProps: { hideBackgroundVideo: false },
      },
      inputProps: { hideBackgroundVideo: false },
      container: videoContainer,
      transparent: false,
      videoBitrate: bitrate,
      onProgress: (p) => {
        updateProgress(p.renderedFrames, totalFrames);
      },
      signal,
    });
    return getBlob();
  }

  async function exportAsPngZip(
    totalFrames: number,
    signal: AbortSignal,
  ): Promise<Blob> {
    const zip = new JSZip();
    const padLength = String(totalFrames - 1).length;
    const safePadLength = Math.max(6, padLength);

    for (let frame = 0; frame < totalFrames; frame++) {
      if (signal.aborted) throw new Error("Export was cancelled");

      const { blob } = await renderStillOnWeb({
        composition: {
          id: "telemetry-overlay",
          component: MainComposition,
          durationInFrames: totalFrames,
          fps,
          width,
          height,
          defaultProps: { hideBackgroundVideo: false },
        },
        inputProps: { hideBackgroundVideo: true },
        frame,
        imageFormat: "png",
        signal,
        licenseKey: "free-license",
      });

      const name = `frame_${String(frame).padStart(safePadLength, "0")}.png`;
      zip.file(name, blob);
      updateProgress(frame + 1, totalFrames);
    }

    return zip.generateAsync({ type: "blob" });
  }

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

    const now = new Date();
    const exportDateString = format(now, "yyyyMMdd-HHmmss");
    const filenamePrefix = `${DEFAULT_EXPORT_FILENAME_PREFIX}-${exportDateString}`;
    const totalFrames = effectiveDurationInFrames;
    const signal = abortController.current.signal;

    initProgress(totalFrames);

    try {
      if (container === "png-sequence") {
        const blob = await exportAsPngZip(totalFrames, signal);
        downloadBlob(blob, `${filenamePrefix}.zip`);
      } else {
        const blob = await exportAsVideo(totalFrames, signal);
        downloadBlob(blob, `${filenamePrefix}.${container}`);
      }
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
