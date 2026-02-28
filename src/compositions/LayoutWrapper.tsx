import type { FC, ReactNode } from "react";
import { useVideoConfig } from "remotion";
import {
  OVERLAY_REFERENCE_HEIGHT,
  OVERLAY_REFERENCE_WIDTH,
} from "@/constants/defaults";
import { useOverlayLayoutStore } from "@/stores/overlayLayoutStore";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";

export type LayoutWrapperProps = {
  children: ReactNode;
};

export const LayoutWrapper: FC<LayoutWrapperProps> = ({ children }) => {
  const { safeAreaVertical, safeAreaHorizontal } = useOverlayLayoutStore();
  const { fontFamily } = useWidgetAppearanceStore();
  const { width, height } = useVideoConfig();

  const isVertical = height > width;
  const isSquare = width === height;
  let refWidth = 0;
  let refHeight = 0;

  if (isSquare) {
    refWidth = OVERLAY_REFERENCE_WIDTH;
    refHeight = OVERLAY_REFERENCE_WIDTH;
  } else if (isVertical) {
    refWidth = OVERLAY_REFERENCE_HEIGHT;
    refHeight = OVERLAY_REFERENCE_WIDTH;
  } else {
    refWidth = OVERLAY_REFERENCE_WIDTH;
    refHeight = OVERLAY_REFERENCE_HEIGHT;
  }

  const overlayScale = Math.min(width / refWidth, height / refHeight);

  return (
    <div
      className="absolute left-0 top-0 origin-top-left"
      style={{
        width: refWidth,
        height: refHeight,
        transform: `scale(${overlayScale})`,
        fontFamily,
      }}
    >
      <div
        className="absolute"
        style={{
          inset: `${safeAreaVertical}% ${safeAreaHorizontal}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
