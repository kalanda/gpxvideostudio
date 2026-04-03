import type { PlayerRef } from "@remotion/player";
import {
  createContext,
  type FC,
  type ReactNode,
  type RefObject,
  useContext,
  useRef,
} from "react";

type VideoPlayerContextValue = {
  playerRef: RefObject<PlayerRef | null>;
};

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export const VideoPlayerProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const playerRef = useRef<PlayerRef>(null);

  return (
    <VideoPlayerContext.Provider value={{ playerRef }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export function useVideoPlayer(): VideoPlayerContextValue {
  const value = useContext(VideoPlayerContext);
  if (value === null) {
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  }
  return value;
}
