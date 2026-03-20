import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";

export function useVideoTrim(durationSeconds: number) {
  const trimRangeRef = useRef<[number, number]>([0, 0]);

  const {
    videoTrimStartSeconds,
    setVideoTrimStartSeconds,
    videoTrimEndSeconds,
    setVideoTrimEndSeconds,
    setTrimPreviewSeconds,
  } = useBackgroundVideoStore(
    useShallow((s) => ({
      videoTrimStartSeconds: s.videoTrimStartSeconds,
      setVideoTrimStartSeconds: s.setVideoTrimStartSeconds,
      videoTrimEndSeconds: s.videoTrimEndSeconds,
      setVideoTrimEndSeconds: s.setVideoTrimEndSeconds,
      setTrimPreviewSeconds: s.setTrimPreviewSeconds,
    })),
  );

  const trimEnd =
    videoTrimEndSeconds > 0 ? videoTrimEndSeconds : durationSeconds;

  // Keep ref in sync with store values so onChange can detect which thumb moved.
  useEffect(() => {
    trimRangeRef.current = [videoTrimStartSeconds, trimEnd];
  }, [videoTrimStartSeconds, trimEnd]);

  // Initialize trim end when video duration becomes available.
  useEffect(() => {
    if (durationSeconds <= 0) return;
    const current = useBackgroundVideoStore.getState().videoTrimEndSeconds;
    setVideoTrimEndSeconds(
      current === 0 ? durationSeconds : Math.min(current, durationSeconds),
    );
  }, [durationSeconds, setVideoTrimEndSeconds]);

  const handleTrimChange = (v: number | number[]) => {
    const arr = Array.isArray(v) ? v : [v, v];
    const max = Math.max(1, Math.floor(durationSeconds));
    let start = Math.min(arr[0], arr[1]);
    let end = Math.max(arr[0], arr[1]);
    if (end <= start) end = Math.min(start + 1, max);
    start = Math.min(start, end - 1);
    const [prevStart, prevEnd] = trimRangeRef.current;
    setVideoTrimStartSeconds(start);
    setVideoTrimEndSeconds(end);
    trimRangeRef.current = [start, end];
    // Preview the frame at the edge being dragged.
    if (start !== prevStart && end === prevEnd) {
      setTrimPreviewSeconds(start);
    } else if (end !== prevEnd) {
      setTrimPreviewSeconds(end);
    } else if (start !== prevStart) {
      setTrimPreviewSeconds(start);
    }
  };

  const handleTrimChangeEnd = () => setTrimPreviewSeconds(null);

  const handleThumbPointerDown = (index: number) => {
    setTrimPreviewSeconds(index === 0 ? videoTrimStartSeconds : trimEnd);
  };

  return {
    videoTrimStartSeconds,
    trimEnd,
    handleTrimChange,
    handleTrimChangeEnd,
    handleThumbPointerDown,
  };
}
