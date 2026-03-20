import { useRef, useState } from "react";

export type ExportProgress = {
  currentFrame: number;
  totalFrames: number;
  progress: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number | null;
};

const INITIAL_PROGRESS: ExportProgress = {
  currentFrame: 0,
  totalFrames: 0,
  progress: 0,
  elapsedSeconds: 0,
  estimatedRemainingSeconds: null,
};

export function useExportProgress() {
  const [exportProgress, setExportProgress] =
    useState<ExportProgress>(INITIAL_PROGRESS);
  const startTimeRef = useRef<number | null>(null);

  const initProgress = (totalFrames: number) => {
    startTimeRef.current = Date.now();
    setExportProgress({ ...INITIAL_PROGRESS, totalFrames });
  };

  const updateProgress = (currentFrame: number, totalFrames: number) => {
    const start = startTimeRef.current ?? Date.now();
    const elapsedSeconds = (Date.now() - start) / 1000;
    const progress = (100 * currentFrame) / totalFrames;
    const estimatedRemainingSeconds =
      progress > 1 ? (elapsedSeconds / progress) * (100 - progress) : null;
    setExportProgress({
      currentFrame,
      totalFrames,
      progress,
      elapsedSeconds,
      estimatedRemainingSeconds,
    });
  };

  const resetProgress = () => {
    startTimeRef.current = null;
    setExportProgress(INITIAL_PROGRESS);
  };

  return { exportProgress, initProgress, updateProgress, resetProgress };
}
