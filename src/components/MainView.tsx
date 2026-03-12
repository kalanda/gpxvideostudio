import { BackgroundVideoTrack } from "@/components/BackgroundVideoTrack";
import { TelemetryTrack } from "@/components/TelemetryTrack";
import { Timeline } from "@/components/Timeline";
import { VideoMonitor } from "@/components/VideoMonitor";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";

export const MainView = () => {
  return (
    <VideoPlayerProvider>
      <div className="flex h-full w-full min-w-0 flex-col gap-4 overflow-auto p-4">
        <main className="flex w-full min-w-0 max-w-full flex-col items-center gap-4">
          <VideoMonitor />
          <Timeline />
          <TelemetryTrack />
          <BackgroundVideoTrack />
        </main>
      </div>
    </VideoPlayerProvider>
  );
};
