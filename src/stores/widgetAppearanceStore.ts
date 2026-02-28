import { create } from "zustand";
import { DEFAULT_WIDGET_APPEARANCE } from "@/constants/defaults";

type WidgetAppearanceState = {
  fontFamily: string;
  accentColor: string;
  primaryColor: string;
};

type WidgetAppearanceActions = {
  setFontFamily: (fontFamily: WidgetAppearanceState["fontFamily"]) => void;
  setAccentColor: (accentColor: WidgetAppearanceState["accentColor"]) => void;
  setPrimaryColor: (primaryColor: WidgetAppearanceState["primaryColor"]) => void;
};

const initialState: WidgetAppearanceState = {
  fontFamily: DEFAULT_WIDGET_APPEARANCE.fontFamily,
  accentColor: DEFAULT_WIDGET_APPEARANCE.accentColor,
  primaryColor: DEFAULT_WIDGET_APPEARANCE.primaryColor,
};

export const useWidgetAppearanceStore = create<
  WidgetAppearanceState & WidgetAppearanceActions
>((set) => ({
  ...initialState,
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setAccentColor: (accentColor) => set({ accentColor }),
  setPrimaryColor: (primaryColor) => set({ primaryColor }),
}));
