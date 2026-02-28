import { create } from "zustand";
import type { TelemetryFeatureCollection } from "@/types/telemetry";

type TelemetryState = {
  telemetryPoints: TelemetryFeatureCollection | null;
  gpxFileName: string | null;
};

type TelemetryActions = {
  setTelemetryPoints: (telemetryPoints: TelemetryFeatureCollection) => void;
  setGpxFileName: (name: string | null) => void;
  clearTelemetry: () => void;
};

const initialState: TelemetryState = {
  telemetryPoints: null,
  gpxFileName: null,
};

export const useTelemetryStore = create<TelemetryState & TelemetryActions>(
  (set) => ({
    ...initialState,
    setTelemetryPoints: (telemetryPoints) =>
      set({
        telemetryPoints,
      }),
    setGpxFileName: (name) => set({ gpxFileName: name }),
    clearTelemetry: () => set({ telemetryPoints: null, gpxFileName: null }),
  }),
);
