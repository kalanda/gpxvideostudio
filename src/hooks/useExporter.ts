import { renderMediaOnWeb, renderStillOnWeb } from "@remotion/web-renderer";
import { format } from "date-fns";
import JSZip from "jszip";
import { useRef, useState } from "react";
import { MainComposition } from "@/compositions/MainComposition";
import {
  DEFAULT_EXPORT_FILENAME_PREFIX,
  DEFAULT_VIDEO_SETTINGS,
  type VideoBitratePresetKey,
  type VideoContainer,
} from "@/constants/defaults";
import { useEffectiveExportDuration } from "@/hooks/useEffectiveExportDuration";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useVideoSettingsStore } from "@/stores/videoSettingsStore";
import { downloadBlob } from "@/utils/browser/downloadBlob";

export function useExporter() {
  // Stores
  const { telemetryPoints } = useTelemetryStore();
  const { fps, width, height } = useVideoSettingsStore();
  const { durationInFrames: effectiveDurationInFrames } =
    useEffectiveExportDuration();

  // Export options (state inside hook, setters exposed)
  const [container, setContainer] = useState<VideoContainer>(
    () => DEFAULT_VIDEO_SETTINGS.container,
  );
  const [videoBitrate, setVideoBitrate] = useState<VideoBitratePresetKey>(
    () => DEFAULT_VIDEO_SETTINGS.videoBitrate,
  );

  // States
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({
    currentFrame: 0,
    totalFrames: 0,
    progress: 0,
    elapsedSeconds: 0,
    estimatedRemainingSeconds: null as number | null,
  });

  // Refs
  const abortController = useRef<AbortController | null>(null);
  const exportStartTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Computed
  const canExport = telemetryPoints && !isExporting;

  /**
   * Export as video (MP4). Used when container is "mp4".
   */
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
      videoBitrate,
      onProgress: (p) => {
        const progress = (100 * p.renderedFrames) / totalFrames;
        const start = exportStartTimeRef.current ?? Date.now();
        const elapsedSeconds = (Date.now() - start) / 1000;
        const estimatedRemainingSeconds =
          progress > 1 ? (elapsedSeconds / progress) * (100 - progress) : null;
        setExportProgress({
          currentFrame: p.renderedFrames,
          totalFrames,
          progress,
          elapsedSeconds,
          estimatedRemainingSeconds,
        });
      },
      signal,
    });
    return getBlob();
  }

  /**
   * Export as ZIP of PNG frames (with transparency). Used when container is "png-sequence".
   */
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

      const progress = (100 * (frame + 1)) / totalFrames;
      const start = exportStartTimeRef.current ?? Date.now();
      const elapsedSeconds = (Date.now() - start) / 1000;
      const estimatedRemainingSeconds =
        progress > 1 ? (elapsedSeconds / progress) * (100 - progress) : null;
      setExportProgress({
        currentFrame: frame + 1,
        totalFrames,
        progress,
        elapsedSeconds,
        estimatedRemainingSeconds,
      });
    }

    return zip.generateAsync({ type: "blob" });
  }

  /**
   * Start the export process. Dispatches to exportAsVideo or exportAsPngZip by container.
   */
  const startExport = async () => {
    if (!telemetryPoints) {
      setError("No telemetry points found.");
      setIsExporting(false);
      return;
    }
    abortController.current = new AbortController();
    exportStartTimeRef.current = Date.now();
    setIsExporting(true);
    setError(null);

    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // Graceful degradation: continue without wake lock (e.g. low battery, policy)
      }
    }

    const now = new Date();
    const exportDateString = format(now, "yyyyMMdd-HHmmss");
    const filenamePrefix = `${DEFAULT_EXPORT_FILENAME_PREFIX}-${exportDateString}`;

    const totalFrames = effectiveDurationInFrames;
    setExportProgress({
      currentFrame: 0,
      totalFrames,
      progress: 0,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: null,
    });
    const signal = abortController.current.signal;

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
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }
  };

  /**
   * Cancel the export process.
   */
  const cancelExport = () => {
    abortController.current?.abort();
    exportStartTimeRef.current = null;
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    setIsExporting(false);
    setExportProgress({
      currentFrame: 0,
      totalFrames: 0,
      progress: 0,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: null,
    });
    setError(null);
  };

  return {
    error,
    isExporting,
    canExport,
    exportProgress,
    startExport,
    cancelExport,
    container,
    videoBitrate,
    setContainer,
    setVideoBitrate,
  };
}
