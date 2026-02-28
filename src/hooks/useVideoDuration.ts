import { useEffect } from "react";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";

/**
 * Loads video metadata and sets duration in the background video store.
 * Call from a component that has backgroundVideoUrl available.
 */
export function useVideoDuration(videoUrl: string | null): void {
  const setBackgroundVideoDuration =
    useBackgroundVideoStore((s) => s.setBackgroundVideoDuration);

  useEffect(() => {
    if (!videoUrl) {
      setBackgroundVideoDuration(null);
      return;
    }

    let cancelled = false;
    const video = document.createElement("video");
    video.preload = "metadata";
    video.style.position = "absolute";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    video.style.width = "0";
    video.style.height = "0";
    document.body.appendChild(video);

    const cleanup = () => {
      cancelled = true;
      video.src = "";
      video.load();
      if (video.parentNode) video.parentNode.removeChild(video);
    };

    video.onerror = () => {
      if (!cancelled) setBackgroundVideoDuration(null);
      cleanup();
    };

    video.onloadedmetadata = () => {
      if (!cancelled && Number.isFinite(video.duration) && video.duration > 0) {
        setBackgroundVideoDuration(video.duration);
      } else if (!cancelled) {
        setBackgroundVideoDuration(null);
      }
      cleanup();
    };

    video.src = videoUrl;
    video.load();

    return cleanup;
  }, [videoUrl, setBackgroundVideoDuration]);
}
