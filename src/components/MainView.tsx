import type { FC } from "react";
import { BackgroundVideoTrack } from "@/components/BackgroundVideoTrack";
import { TelemetryTrack } from "@/components/TelemetryTrack";
import { VideoMonitor } from "@/components/VideoMonitor";

export const MainView: FC = () => {
  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-4 overflow-auto p-4">
      <main className="flex w-full min-w-0 max-w-full flex-col items-center gap-4">
        <VideoMonitor />
        <TelemetryTrack />
        <BackgroundVideoTrack />
      </main>
    </div>
  );
};
