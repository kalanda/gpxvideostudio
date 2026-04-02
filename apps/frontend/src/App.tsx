import { HeroUIProvider } from "@heroui/react";
import clsx from "clsx";
import { StrictMode } from "react";
import { useShallow } from "zustand/react/shallow";
import { MainView } from "@/components/MainView";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";
import { Theme, useUiPreferencesStore } from "@/stores/uiPreferencesStore";

export const App = () => {
  const { theme } = useUiPreferencesStore(
    useShallow((s) => ({ theme: s.theme })),
  );

  const appClassName = clsx("min-h-full w-full bg-background/80", {
    dark: theme === Theme.Dark,
  });

  return (
    <StrictMode>
      <HeroUIProvider className={appClassName}>
        <VideoPlayerProvider>
          <MainView />
        </VideoPlayerProvider>
      </HeroUIProvider>
    </StrictMode>
  );
};
