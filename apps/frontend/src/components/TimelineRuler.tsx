import type { FC } from "react";
import { useRef } from "react";
import { formatPlaybackTime } from "@/utils/format/formatPlaybackTime";

/** Minimum visual gap between ticks in pixels */
const MIN_TICK_PX = 80;
const NICE_INTERVALS_SEC = [0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

/**
 * Pick the smallest "nice" interval (in seconds) such that ticks are
 * at least MIN_TICK_PX pixels apart given the current pixel density.
 */
function pickTickIntervalSeconds(pixelsPerSecond: number): number {
  if (pixelsPerSecond <= 0)
    return NICE_INTERVALS_SEC[NICE_INTERVALS_SEC.length - 1];
  const minIntervalSeconds = MIN_TICK_PX / pixelsPerSecond;
  const found = NICE_INTERVALS_SEC.find((n) => n >= minIntervalSeconds);
  return found ?? NICE_INTERVALS_SEC[NICE_INTERVALS_SEC.length - 1];
}

export type TimelineRulerProps = {
  /** Total duration in seconds used to space the ticks. */
  durationSeconds: number;
  /** Pixels rendered per second at the current zoom level, used to set tick density. */
  pixelsPerSecond: number;
  /** Total frames used to convert a click position to a frame number. */
  totalFrames: number;
  /** Called with the target frame when the user clicks or drags the ruler. */
  onSeek: (frame: number) => void;
};

/**
 * Horizontal time ruler that shows evenly spaced time ticks.
 * Supports click and drag to seek.
 */
export const TimelineRuler: FC<TimelineRulerProps> = ({
  durationSeconds,
  pixelsPerSecond,
  totalFrames,
  onSeek,
}) => {
  // Refs so drag handlers always read the latest values without re-registering
  const totalFramesRef = useRef(totalFrames);
  totalFramesRef.current = totalFrames;
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;
  const rulerRef = useRef<HTMLButtonElement>(null);

  const tickInterval = pickTickIntervalSeconds(pixelsPerSecond);
  const ticks: { seconds: number; leftPercent: number }[] = [];
  for (let s = 0; s <= durationSeconds; s += tickInterval) {
    const clamped = Math.min(s, durationSeconds);
    ticks.push({
      seconds: clamped,
      leftPercent: durationSeconds > 0 ? (clamped / durationSeconds) * 100 : 0,
    });
  }

  const seekFromClientX = (clientX: number) => {
    const rect = rulerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (clientX - rect.left) / rect.width;
    onSeekRef.current(
      Math.round(Math.max(0, Math.min(1, ratio)) * totalFramesRef.current),
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    seekFromClientX(e.clientX);

    const onMouseMove = (ev: MouseEvent) => {
      ev.preventDefault();
      seekFromClientX(ev.clientX);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <button
      ref={rulerRef}
      type="button"
      className="relative h-6 w-full shrink-0 cursor-pointer border-b border-default-300 bg-default-200/80 px-0.5 text-left"
      onMouseDown={handleMouseDown}
    >
      {ticks.map(({ seconds, leftPercent }) => (
        <div
          key={`${seconds}-${leftPercent}`}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${leftPercent}%`, transform: "translateX(-50%)" }}
        >
          <div className="h-1.5 w-px bg-default-500" />
          <span className="mt-0.5 select-none font-mono text-[10px] tabular-nums text-default-500">
            {formatPlaybackTime(seconds)}
          </span>
        </div>
      ))}
    </button>
  );
};
