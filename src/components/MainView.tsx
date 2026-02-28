import { VideoPreview } from "@/components/VideoPreview";
import { BackgroundVideoTrack } from "./BackgroundVideoTrack";
import { TelemetryTrack } from "./TelemetryTrack";

export const MainView = () => {
  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-4 overflow-auto p-4">
      <main className="flex w-full min-w-0 max-w-full flex-col items-center gap-4">
        <VideoPreview />
        <TelemetryTrack />
        <BackgroundVideoTrack />
      </main>
    </div>
  );
};
