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
    <div className="flex min-h-12 items-center gap-0.5 rounded border border-default bg-default p-1">
      {isLoading ? (
        <span className="px-2 text-xs text-foreground/60">
          Generating thumbnails…
        </span>
      ) : thumbnails.length > 0 ? (
        thumbnails.map((src, index) => (
          <div
            key={`thumbnail-${
              // biome-ignore lint/suspicious/noArrayIndexKey: ok to use index as key
              index
            }`}
            className="flex-1 h-10"
          >
            <img
              src={src}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))
      ) : null}
    </div>
  );
};
