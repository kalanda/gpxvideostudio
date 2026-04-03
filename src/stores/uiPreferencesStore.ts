import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum Theme {
  Light = "light",
  Dark = "dark",
}

type UiPreferencesState = {
  theme: Theme;
};

type UiPreferencesActions = {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useUiPreferencesStore = create<
  UiPreferencesState & UiPreferencesActions
>()(
  persist(
    (set, get) => ({
      theme: Theme.Dark,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === Theme.Dark ? Theme.Light : Theme.Dark }),
    }),
    { name: "ui-preferences" },
  ),
);
