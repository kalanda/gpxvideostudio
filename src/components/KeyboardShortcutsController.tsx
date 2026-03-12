import type { FC } from "react";
import { useKey } from "react-use";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";

/** Tags whose focused state should block global keyboard shortcuts */
const BLOCKING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableTarget(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  return Boolean(
    el && (BLOCKING_TAGS.has(el.tagName) || el.isContentEditable),
  );
}

/**
 * Renderless component that registers global keyboard shortcuts for the player.
 * Must be rendered inside VideoPlayerProvider.
 *
 * Shortcuts:
 *   Space  — toggle play / pause
 */
export const KeyboardShortcutsController: FC = () => {
  const { togglePlay } = useVideoPlayerControls();

  useKey(
    " ",
    (e) => {
      if (isEditableTarget(e)) return;
      e.preventDefault();
      togglePlay();
    },
    { event: "keydown" },
  );

  return null;
};
