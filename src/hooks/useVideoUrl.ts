import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";

export function useVideoUrl() {
  const {
    backgroundVideoUrl,
    setBackgroundVideoUrl,
    setBackgroundVideoFileName,
    clearBackgroundVideo,
  } = useBackgroundVideoStore(
    useShallow((s) => ({
      backgroundVideoUrl: s.backgroundVideoUrl,
      setBackgroundVideoUrl: s.setBackgroundVideoUrl,
      setBackgroundVideoFileName: s.setBackgroundVideoFileName,
      clearBackgroundVideo: s.clearBackgroundVideo,
    })),
  );

  useEffect(() => {
    return () => {
      if (backgroundVideoUrl) URL.revokeObjectURL(backgroundVideoUrl);
    };
  }, [backgroundVideoUrl]);

  const setFile = (file: File) => {
    if (backgroundVideoUrl) URL.revokeObjectURL(backgroundVideoUrl);
    setBackgroundVideoFileName(file.name);
    setBackgroundVideoUrl(URL.createObjectURL(file));
  };

  const clearUrl = () => {
    if (backgroundVideoUrl) URL.revokeObjectURL(backgroundVideoUrl);
    clearBackgroundVideo();
  };

  return { backgroundVideoUrl, setFile, clearUrl };
}
