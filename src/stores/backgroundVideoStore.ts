import { create } from "zustand";

type BackgroundVideoState = {
  backgroundVideoUrl: string | null;
  backgroundVideoFileName: string | null;
  backgroundVideoDurationSeconds: number | null;
  videoTrimStartSeconds: number;
  videoTrimEndSeconds: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
};

type BackgroundVideoActions = {
  setBackgroundVideoUrl: (url: string | null) => void;
  setBackgroundVideoFileName: (name: string | null) => void;
  setBackgroundVideoDuration: (seconds: number | null) => void;
  setVideoTrimStartSeconds: (seconds: number) => void;
  setVideoTrimEndSeconds: (seconds: number) => void;
  setFlipHorizontal: (value: boolean) => void;
  setFlipVertical: (value: boolean) => void;
  clearBackgroundVideo: () => void;
};

const initialState: BackgroundVideoState = {
  backgroundVideoUrl: null,
  backgroundVideoFileName: null,
  backgroundVideoDurationSeconds: null,
  videoTrimStartSeconds: 0,
  videoTrimEndSeconds: 0,
  flipHorizontal: false,
  flipVertical: false,
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
  setFlipHorizontal: (value) => set({ flipHorizontal: value }),
  setFlipVertical: (value) => set({ flipVertical: value }),
  clearBackgroundVideo: () =>
    set({
      backgroundVideoUrl: null,
      backgroundVideoFileName: null,
      backgroundVideoDurationSeconds: null,
      flipHorizontal: false,
      flipVertical: false,
    }),
}));
