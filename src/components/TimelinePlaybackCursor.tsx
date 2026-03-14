import type { FC } from "react";

export type TimelinePlaybackCursorProps = {
  /** Cursor position in pixels from the left edge of the content area. */
  leftPx: number;
};

export const TimelinePlaybackCursor: FC<TimelinePlaybackCursorProps> = ({
  leftPx,
}) => {
  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 min-w-[2px] bg-primary shadow-sm"
      style={{
        left: leftPx,
        transform: "translateX(-50%)",
      }}
      aria-hidden
    />
  );
};
