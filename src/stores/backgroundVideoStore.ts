import { create } from "zustand";

type BackgroundVideoState = {
  backgroundVideoUrl: string | null;
  backgroundVideoFileName: string | null;
  backgroundVideoDurationSeconds: number | null;
  videoTrimStartSeconds: number;
  videoTrimEndSeconds: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  /**
   * Absolute timestamp of video frame t=0 (the very start of the raw video file).
   * Set by the sync modal. Null when no sync has been performed.
   * Changing videoTrimStart/End does not affect this value — sync is stored independently.
   */
  videoStartTimestamp: Date | null;
  /**
   * When non-null, the video preview should show this video time (seconds). Used while
   * dragging the trim slider; cleared on release so playback position is restored.
   */
  trimPreviewSeconds: number | null;
};

type BackgroundVideoActions = {
  setBackgroundVideoUrl: (url: string | null) => void;
  setBackgroundVideoFileName: (name: string | null) => void;
  setBackgroundVideoDuration: (seconds: number | null) => void;
  setVideoTrimStartSeconds: (seconds: number) => void;
  setVideoTrimEndSeconds: (seconds: number) => void;
  setFlipHorizontal: (value: boolean) => void;
  setFlipVertical: (value: boolean) => void;
  setVideoStartTimestamp: (timestamp: Date | null) => void;
  setTrimPreviewSeconds: (seconds: number | null) => void;
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
  videoStartTimestamp: null,
  trimPreviewSeconds: null,
};

export const useBackgroundVideoStore = create<
  BackgroundVideoState & BackgroundVideoActions
>((set) => ({
  ...initialState,
  setBackgroundVideoUrl: (url) =>
    set(
      url
        ? {
            // New video loaded: reset sync and trims so they don't carry over.
            backgroundVideoUrl: url,
            videoTrimStartSeconds: 0,
            videoTrimEndSeconds: 0,
            videoStartTimestamp: null,
          }
        : {
            backgroundVideoUrl: null,
            backgroundVideoDurationSeconds: null,
          },
    ),
  setBackgroundVideoFileName: (name) => set({ backgroundVideoFileName: name }),
  setBackgroundVideoDuration: (seconds) =>
    set({ backgroundVideoDurationSeconds: seconds }),
  setVideoTrimStartSeconds: (seconds) =>
    set({ videoTrimStartSeconds: Math.max(0, seconds) }),
  setVideoTrimEndSeconds: (seconds) =>
    set({ videoTrimEndSeconds: Math.max(0, seconds) }),
  setFlipHorizontal: (value) => set({ flipHorizontal: value }),
  setFlipVertical: (value) => set({ flipVertical: value }),
  setVideoStartTimestamp: (timestamp) =>
    set({ videoStartTimestamp: timestamp }),
  setTrimPreviewSeconds: (seconds) => set({ trimPreviewSeconds: seconds }),
  clearBackgroundVideo: () => set({ ...initialState }),
}));
