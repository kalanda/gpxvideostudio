import { HeroUIProvider } from "@heroui/react";
import clsx from "clsx";
import { StrictMode, useEffect, useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { KeyboardShortcutsController } from "@/components/KeyboardShortcutsController";
import { MainView } from "@/components/MainView";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";

const THEME_KEY = "gpx-video-theme";
type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
};

export const App = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <StrictMode>
      <HeroUIProvider
        className={clsx("min-h-full w-full bg-background/80", {
          dark: theme === "dark",
        })}
      >
        <VideoPlayerProvider>
          <KeyboardShortcutsController />
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
