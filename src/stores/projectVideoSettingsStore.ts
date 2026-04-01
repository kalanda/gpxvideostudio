import { create } from "zustand";
import { DEFAULT_VIDEO_SETTINGS } from "@/constants/defaults";
import type { VideoBitrate } from "@/types/video";

type ProjectVideoSettingsState = {
  width: number;
  height: number;
  fps: number;
  bitrate: VideoBitrate;
};

type ProjectVideoSettingsActions = {
  setWidth: (width: ProjectVideoSettingsState["width"]) => void;
  setHeight: (height: ProjectVideoSettingsState["height"]) => void;
  setFps: (fps: ProjectVideoSettingsState["fps"]) => void;
  setBitrate: (bitrate: ProjectVideoSettingsState["bitrate"]) => void;
};

const initialState: ProjectVideoSettingsState = {
  width: DEFAULT_VIDEO_SETTINGS.width,
  height: DEFAULT_VIDEO_SETTINGS.height,
  fps: DEFAULT_VIDEO_SETTINGS.fps,
  bitrate: DEFAULT_VIDEO_SETTINGS.bitrate,
};

export const useProjectVideoSettingsStore = create<
  ProjectVideoSettingsState & ProjectVideoSettingsActions
>((set) => ({
  ...initialState,
  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setFps: (fps) => set({ fps }),
  setBitrate: (bitrate) => set({ bitrate }),
}));
