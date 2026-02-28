import { create } from "zustand";
import { DEFAULT_VIDEO_SETTINGS } from "@/constants/defaults";

type VideoSettingsState = {
  width: number;
  height: number;
  fps: number;
};

type VideoSettingsActions = {
  setWidth: (width: VideoSettingsState["width"]) => void;
  setHeight: (height: VideoSettingsState["height"]) => void;
  setFps: (fps: VideoSettingsState["fps"]) => void;
};

const initialState: VideoSettingsState = {
  width: DEFAULT_VIDEO_SETTINGS.width,
  height: DEFAULT_VIDEO_SETTINGS.height,
  fps: DEFAULT_VIDEO_SETTINGS.fps,
};

export const useVideoSettingsStore = create<
  VideoSettingsState & VideoSettingsActions
>((set) => ({
  ...initialState,
  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setFps: (fps) => set({ fps }),
}));
