import { create } from "zustand";

type BackgroundVideoState = {
  backgroundVideoUrl: string | null;
  backgroundVideoFileName: string | null;
  backgroundVideoDurationSeconds: number | null;
  videoTrimStartSeconds: number;
  videoTrimEndSeconds: number;
  gpxTrimStartSeconds: number;
  gpxTrimEndSeconds: number;
};

type BackgroundVideoActions = {
  setBackgroundVideoUrl: (url: string | null) => void;
  setBackgroundVideoFileName: (name: string | null) => void;
  setBackgroundVideoDuration: (seconds: number | null) => void;
  setVideoTrimStartSeconds: (seconds: number) => void;
  setVideoTrimEndSeconds: (seconds: number) => void;
  setGpxTrimStartSeconds: (seconds: number) => void;
  setGpxTrimEndSeconds: (seconds: number) => void;
  clearBackgroundVideo: () => void;
};

const initialState: BackgroundVideoState = {
  backgroundVideoUrl: null,
  backgroundVideoFileName: null,
  backgroundVideoDurationSeconds: null,
  videoTrimStartSeconds: 0,
  videoTrimEndSeconds: 0,
  gpxTrimStartSeconds: 0,
  gpxTrimEndSeconds: 0,
};

export const useBackgroundVideoStore = create<
  BackgroundVideoState & BackgroundVideoActions
>((set) => ({
  ...initialState,
  setBackgroundVideoUrl: (url) =>
    set({
      backgroundVideoUrl: url,
      ...(url ? {} : { backgroundVideoDurationSeconds: null }),
    }),
  setBackgroundVideoFileName: (name) => set({ backgroundVideoFileName: name }),
  setBackgroundVideoDuration: (seconds) =>
    set({ backgroundVideoDurationSeconds: seconds }),
  setVideoTrimStartSeconds: (seconds) =>
    set({ videoTrimStartSeconds: Math.max(0, seconds) }),
  setVideoTrimEndSeconds: (seconds) =>
    set({ videoTrimEndSeconds: Math.max(0, seconds) }),
  setGpxTrimStartSeconds: (seconds) =>
    set({ gpxTrimStartSeconds: Math.max(0, seconds) }),
  setGpxTrimEndSeconds: (seconds) =>
    set({ gpxTrimEndSeconds: Math.max(0, seconds) }),
  clearBackgroundVideo: () =>
    set({
      backgroundVideoUrl: null,
      backgroundVideoFileName: null,
      backgroundVideoDurationSeconds: null,
    }),
}));
