import { create } from "zustand";
import {
  DEFAULT_WIDGET_APPEARANCE,
  type MapBearingMode,
  type MapPitch,
  type MapTheme,
  type MapViewportMode,
} from "@/constants/defaults";

type WidgetAppearanceState = {
  fontFamily: string;
  accentColor: string;
  primaryColor: string;
  mapTheme: MapTheme;
  mapBearingMode: MapBearingMode;
  mapViewportMode: MapViewportMode;
  mapPitch: MapPitch;
};

type WidgetAppearanceActions = {
  setFontFamily: (fontFamily: WidgetAppearanceState["fontFamily"]) => void;
  setAccentColor: (accentColor: WidgetAppearanceState["accentColor"]) => void;
  setPrimaryColor: (
    primaryColor: WidgetAppearanceState["primaryColor"],
  ) => void;
  setMapTheme: (mapTheme: MapTheme) => void;
  setMapBearingMode: (mapBearingMode: MapBearingMode) => void;
  setMapViewportMode: (mapViewportMode: MapViewportMode) => void;
  setMapPitch: (mapPitch: MapPitch) => void;
};

const initialState: WidgetAppearanceState = {
  fontFamily: DEFAULT_WIDGET_APPEARANCE.fontFamily,
  accentColor: DEFAULT_WIDGET_APPEARANCE.accentColor,
  primaryColor: DEFAULT_WIDGET_APPEARANCE.primaryColor,
  mapTheme: DEFAULT_WIDGET_APPEARANCE.mapTheme,
  mapBearingMode: DEFAULT_WIDGET_APPEARANCE.mapBearingMode,
  mapViewportMode: DEFAULT_WIDGET_APPEARANCE.mapViewportMode,
  mapPitch: DEFAULT_WIDGET_APPEARANCE.mapPitch,
};

export const useWidgetAppearanceStore = create<
  WidgetAppearanceState & WidgetAppearanceActions
>((set) => ({
  ...initialState,
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setAccentColor: (accentColor) => set({ accentColor }),
  setPrimaryColor: (primaryColor) => set({ primaryColor }),
  setMapTheme: (mapTheme) => set({ mapTheme }),
  setMapBearingMode: (mapBearingMode) => set({ mapBearingMode }),
  setMapViewportMode: (mapViewportMode) => set({ mapViewportMode }),
  setMapPitch: (mapPitch) => set({ mapPitch }),
}));
