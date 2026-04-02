import { useEffect, useState } from "react";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";

/**
 * Hook that provides video player control methods and playback state.
 * Subscribes to player events so state stays in sync. Use from any component
 * that needs to control playback or read current frame/play state.
 */
export function useVideoPlayerControls() {
  const { playerRef } = useVideoPlayer();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supportsFullscreen, setSupportsFullscreen] = useState(false);

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

  const togglePlay = () => {
    playerRef.current?.toggle();
  };

  const toggleMute = () => {
    const current = playerRef.current;
    if (!current) return;
    if (current.isMuted()) {
      current.unmute();
    } else {
      current.mute();
    }
  };

  const toggleFullscreen = () => {
    const current = playerRef.current;
    if (!current) return;
    if (document.fullscreenElement) {
      current.exitFullscreen();
    } else {
      current.requestFullscreen();
    }
  };

  const seekTo = (frame: number) => {
    playerRef.current?.seekTo(Math.round(frame));
  };

  return {
    playerRef,
    currentFrame,
    isPlaying,
    isMuted,
    isFullscreen,
    supportsFullscreen,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seekTo,
  };
}
