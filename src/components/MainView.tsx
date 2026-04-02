import type { FC } from "react";
import { BackgroundVideoTrack } from "@/components/BackgroundVideoTrack";
import { TelemetryTrack } from "@/components/TelemetryTrack";
import { VideoMonitor } from "@/components/VideoMonitor";
import { AppNavbar } from "./AppNavbar";

export const MainView: FC = () => {
  return (
    <div className="flex flex-col">
      <AppNavbar />
      <div className="flex flex-col gap-4 p-4 w-full min-w-0 max-w-full">
        <VideoMonitor />
        <TelemetryTrack />
        <BackgroundVideoTrack />
      </div>
    </div>
  );
};
