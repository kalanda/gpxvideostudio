import { VideoPreview } from "@/components/VideoPreview";
import { BackgroundVideoTrack } from "./BackgroundVideoTrack";
import { TelemetryTrack } from "./TelemetryTrack";

export const MainView = () => {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden p-4">
      <main className="flex w-full flex-col items-center gap-4">
        <VideoPreview />
        <TelemetryTrack />
        <BackgroundVideoTrack />
      </main>
    </div>
  );
};
