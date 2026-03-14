import { create } from "zustand";
import {
  DEFAULT_VIDEO_SETTINGS,
  type VideoBitratePresetKey,
  type VideoContainer,
} from "@/constants/defaults";

type VideoSettingsState = {
  width: number;
  height: number;
  fps: number;
  container: VideoContainer;
  videoBitrate: VideoBitratePresetKey;
};

type VideoSettingsActions = {
  setWidth: (width: VideoSettingsState["width"]) => void;
  setHeight: (height: VideoSettingsState["height"]) => void;
  setFps: (fps: VideoSettingsState["fps"]) => void;
  setContainer: (container: VideoContainer) => void;
  setVideoBitrate: (videoBitrate: VideoBitratePresetKey) => void;
};

const initialState: VideoSettingsState = {
  width: DEFAULT_VIDEO_SETTINGS.width,
  height: DEFAULT_VIDEO_SETTINGS.height,
  fps: DEFAULT_VIDEO_SETTINGS.fps,
  container: DEFAULT_VIDEO_SETTINGS.container,
  videoBitrate: DEFAULT_VIDEO_SETTINGS.videoBitrate,
};

export const useVideoSettingsStore = create<
  VideoSettingsState & VideoSettingsActions
>((set) => ({
  ...initialState,
  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setFps: (fps) => set({ fps }),
  setContainer: (container) => set({ container }),
  setVideoBitrate: (videoBitrate) => set({ videoBitrate }),
}));
