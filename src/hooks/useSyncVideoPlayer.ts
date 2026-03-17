import { useEffect, useRef, useState } from "react";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";

/**
 * Manages the video element state and controls for the sync modal.
 * Reads fps from the project settings store internally.
 * Resets playback state whenever the modal opens.
 */
export function useSyncVideoPlayer(isOpen: boolean) {
  const fps = useProjectVideoSettingsStore((s) => s.fps);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVideoCurrentTime(0);
      setVideoIsPlaying(false);
    }
  }, [isOpen]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setVideoCurrentTime(v.currentTime);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setVideoDuration(v.duration);
  };

  const handleVideoEnded = () => setVideoIsPlaying(false);
  const handleVideoPlay = () => setVideoIsPlaying(true);
  const handleVideoPause = () => setVideoIsPlaying(false);

  const toggleVideoPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  const handleVideoSeek = (value: number | number[]) => {
    const v = videoRef.current;
    if (!v) return;
    const t = typeof value === "number" ? value : (value[0] ?? 0);
    v.currentTime = t;
    setVideoCurrentTime(t);
  };

  const stepFrame = (direction: 1 | -1) => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = Math.max(
      0,
      Math.min(v.duration, v.currentTime + direction / fps),
    );
  };

  return {
    videoRef,
    videoCurrentTime,
    videoDuration,
    videoIsPlaying,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleVideoEnded,
    handleVideoPlay,
    handleVideoPause,
    toggleVideoPlay,
    handleVideoSeek,
    stepFrame,
  };
}
