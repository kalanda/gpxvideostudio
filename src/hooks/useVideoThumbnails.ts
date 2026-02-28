import { useEffect, useState } from "react";

const THUMB_COUNT = 20;
const THUMB_HEIGHT = 48;
const THUMB_QUALITY = 0.7;

/**
 * Generates video thumbnails at evenly spaced instants over the duration.
 * Uses a hidden video + canvas; seeks to each instant and captures the frame.
 */
export function useVideoThumbnails(
  videoUrl: string | null,
  options: { count?: number; height?: number } = {},
): { thumbnails: string[]; isLoading: boolean } {
  const count = options.count ?? THUMB_COUNT;
  const height = options.height ?? THUMB_HEIGHT;
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setThumbnails([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    video.style.position = "absolute";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    video.style.width = "1px";
    video.style.height = "1px";
    document.body.appendChild(video);

    const cleanup = () => {
      cancelled = true;
      video.src = "";
      video.load();
      if (video.parentNode) video.parentNode.removeChild(video);
    };

    video.onerror = () => {
      if (!cancelled) {
        setThumbnails([]);
        setIsLoading(false);
      }
      cleanup();
    };

    video.onloadedmetadata = () => {
      if (cancelled) {
        cleanup();
        return;
      }
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        setThumbnails([]);
        setIsLoading(false);
        cleanup();
        return;
      }

      setIsLoading(true);
      const times: number[] = [];
      for (let i = 0; i < count; i++) {
        const t = (duration * (i + 0.5)) / count;
        times.push(Math.min(t, duration - 0.01));
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setThumbnails([]);
        setIsLoading(false);
        cleanup();
        return;
      }

      const results: string[] = [];

      const captureNext = (index: number) => {
        if (cancelled || index >= times.length) {
          if (!cancelled) {
            setThumbnails(results);
            setIsLoading(false);
          }
          cleanup();
          return;
        }

        const t = times[index];
        video.currentTime = t;
      };

      video.onseeked = () => {
        if (cancelled) return;
        const index = results.length;
        const w = (video.videoWidth / video.videoHeight) * height;
        canvas.width = w;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, w, height);
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", THUMB_QUALITY);
          results.push(dataUrl);
        } catch {
          // CORS o canvas tainted
        }
        if (cancelled) return;
        captureNext(index + 1);
      };

      video.currentTime = times[0];
    };

    video.src = videoUrl;
    video.load();

    return cleanup;
  }, [videoUrl, count, height]);

  return { thumbnails, isLoading };
}
