import { HeroUIProvider } from "@heroui/react";
import clsx from "clsx";
import { StrictMode } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { MainView } from "@/components/MainView";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";
import { Theme, useUiPreferencesStore } from "@/stores/uiPreferencesStore";

export const App = () => {
  const { theme, toggleTheme } = useUiPreferencesStore();

  return (
    <StrictMode>
      <HeroUIProvider
        className={clsx("min-h-full w-full bg-background/80", {
          dark: theme === Theme.Dark,
        })}
      >
        <VideoPlayerProvider>
          <div className="flex h-full w-full flex-col overflow-hidden">
            <AppNavbar theme={theme} onToggleTheme={toggleTheme} />
            <div className="min-h-0 flex-1 overflow-hidden">
              <MainView />
            </div>
          </div>
        </VideoPlayerProvider>
      </HeroUIProvider>
    </StrictMode>
  );
};
