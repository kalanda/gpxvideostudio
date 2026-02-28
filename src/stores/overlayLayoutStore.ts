import { create } from "zustand";
import { DEFAULT_OVERLAY_LAYOUT } from "@/constants/defaults";

type OverlayLayoutState = {
  safeAreaVertical: number;
  safeAreaHorizontal: number;
};

type OverlayLayoutActions = {
  setSafeAreaVertical: (
    safeAreaVertical: OverlayLayoutState["safeAreaVertical"],
  ) => void;
  setSafeAreaHorizontal: (
    safeAreaHorizontal: OverlayLayoutState["safeAreaHorizontal"],
  ) => void;
};

const initialState: OverlayLayoutState = {
  safeAreaVertical: DEFAULT_OVERLAY_LAYOUT.safeAreaVertical,
  safeAreaHorizontal: DEFAULT_OVERLAY_LAYOUT.safeAreaHorizontal,
};

export const useOverlayLayoutStore = create<
  OverlayLayoutState & OverlayLayoutActions
>((set) => ({
  ...initialState,
  setSafeAreaVertical: (safeAreaVertical) => set({ safeAreaVertical }),
  setSafeAreaHorizontal: (safeAreaHorizontal) => set({ safeAreaHorizontal }),
}));
