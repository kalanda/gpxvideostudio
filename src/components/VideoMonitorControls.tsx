import { Button, Slider } from "@heroui/react";
import type { PlayerRef } from "@remotion/player";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { FC, RefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import { secondsToHMS } from "@/utils/format/secondsToHMS";

/** Format seconds as HH:MM:SS for playback display (always 3 segments) */
function formatPlaybackTime(seconds: number): string {
  const { h, m, s } = secondsToHMS(Math.max(0, Math.floor(seconds)));
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export type VideoMonitorControlsProps = {
  playerRef: RefObject<PlayerRef | null>;
  fps: number;
  durationInFrames: number;
};

export const VideoMonitorControls: FC<VideoMonitorControlsProps> = ({
  playerRef,
  fps,
  durationInFrames,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supportsFullscreen, setSupportsFullscreen] = useState(false);

  const durationSeconds = durationInFrames / fps;
  const currentSeconds = currentFrame / fps;

  useEffect(() => {
    const current = playerRef.current;
    if (!current) return;

    setCurrentFrame(current.getCurrentFrame());
    setIsPlaying(current.isPlaying());
    setIsMuted(current.isMuted());

    const onFrameUpdate = () => setCurrentFrame(current.getCurrentFrame());
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onMuteChange = () => setIsMuted(current.isMuted());
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement !== null);

    current.addEventListener("frameupdate", onFrameUpdate);
    current.addEventListener("play", onPlay);
    current.addEventListener("pause", onPause);
    current.addEventListener("mutechange", onMuteChange);
    current.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      current.removeEventListener("frameupdate", onFrameUpdate);
      current.removeEventListener("play", onPlay);
      current.removeEventListener("pause", onPause);
      current.removeEventListener("mutechange", onMuteChange);
      current.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [playerRef]);

  useEffect(() => {
    setSupportsFullscreen(
      typeof document !== "undefined" &&
        (document.fullscreenEnabled ||
          Boolean(
            (document as Document & { webkitFullscreenEnabled?: boolean })
              .webkitFullscreenEnabled,
          )),
    );
  }, []);

  const onTogglePlay = useCallback(() => {
    playerRef.current?.toggle();
  }, [playerRef]);

  const onToggleMute = useCallback(() => {
    const current = playerRef.current;
    if (!current) return;
    if (current.isMuted()) {
      current.unmute();
    } else {
      current.mute();
    }
  }, [playerRef]);

  const onToggleFullscreen = useCallback(() => {
    const current = playerRef.current;
    if (!current) return;
    if (document.fullscreenElement) {
      current.exitFullscreen();
    } else {
      current.requestFullscreen();
    }
  }, [playerRef]);

  const onSeek = useCallback(
    (value: number | number[]) => {
      const frame = typeof value === "number" ? value : (value[0] ?? 0);
      playerRef.current?.seekTo(Math.round(frame));
    },
    [playerRef],
  );

  return (
    <div className="flex flex-col gap-1.5 rounded-b-small bg-default-100 px-2 py-1.5">
      <Slider
        size="sm"
        step={1}
        minValue={0}
        maxValue={Math.max(1, durationInFrames)}
        value={currentFrame}
        onChange={onSeek}
        aria-label="Video position"
      />
      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label={isPlaying ? "Pause" : "Play"}
          onPress={onTogglePlay}
          className="min-w-8"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </Button>

        <div className="flex items-center font-mono text-xs text-foreground tabular-nums gap-1">
          <span className="text-primary">
            {formatPlaybackTime(currentSeconds)}
          </span>
          <span className="text-foreground/40">{` / `}</span>
          <span className="text-foreground">
            {formatPlaybackTime(durationSeconds)}
          </span>
        </div>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label={isMuted ? "Unmute" : "Mute"}
          onPress={onToggleMute}
          className="min-w-8"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>

        {supportsFullscreen && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onPress={onToggleFullscreen}
            className="ml-auto min-w-8 text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </Button>
        )}
      </div>
    </div>
  );
};
