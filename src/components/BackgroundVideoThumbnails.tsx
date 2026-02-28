import type { FC } from "react";
import { useVideoThumbnails } from "@/hooks/useVideoThumbnails";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";

export const BackgroundVideoThumbnails: FC = () => {
  const backgroundVideoUrl = useBackgroundVideoStore(
    (s) => s.backgroundVideoUrl,
  );
  const { thumbnails, isLoading } = useVideoThumbnails(backgroundVideoUrl);

  if (!backgroundVideoUrl) return null;

  return (
    <div className="flex min-h-12 items-center gap-0.5 overflow-x-auto rounded border border-default bg-default p-1">
      {isLoading ? (
        <span className="px-2 text-xs text-foreground/60">
          Generating thumbnails…
        </span>
      ) : thumbnails.length > 0 ? (
        thumbnails.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            className="h-12 shrink-0 rounded-sm object-cover"
            height={48}
          />
        ))
      ) : null}
    </div>
  );
};
