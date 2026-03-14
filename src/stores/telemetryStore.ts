import { create } from "zustand";
import type { TelemetryFeatureCollection } from "@/types/telemetry";

type TelemetryState = {
  telemetryPoints: TelemetryFeatureCollection | null;
  gpxFileName: string | null;
  gpxTrimStartSeconds: number;
  gpxTrimEndSeconds: number;
};

type TelemetryActions = {
  setTelemetryPoints: (telemetryPoints: TelemetryFeatureCollection) => void;
  setGpxFileName: (name: string | null) => void;
  setGpxTrimStartSeconds: (seconds: number) => void;
  setGpxTrimEndSeconds: (seconds: number) => void;
  clearTelemetry: () => void;
};

const initialState: TelemetryState = {
  telemetryPoints: null,
  gpxFileName: null,
  gpxTrimStartSeconds: 0,
  gpxTrimEndSeconds: 0,
};

export const useTelemetryStore = create<TelemetryState & TelemetryActions>(
  (set) => ({
    ...initialState,
    setTelemetryPoints: (telemetryPoints) => set({ telemetryPoints }),
    setGpxFileName: (name) => set({ gpxFileName: name }),
    setGpxTrimStartSeconds: (seconds) =>
      set({ gpxTrimStartSeconds: Math.max(0, seconds) }),
    setGpxTrimEndSeconds: (seconds) =>
      set({ gpxTrimEndSeconds: Math.max(0, seconds) }),
    clearTelemetry: () =>
      set({
        telemetryPoints: null,
        gpxFileName: null,
        gpxTrimStartSeconds: 0,
        gpxTrimEndSeconds: 0,
      }),
  }),
);
