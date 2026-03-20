import { Slider } from "@heroui/react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useVideoTrim } from "@/hooks/useVideoTrim";
import { formatTime } from "@/utils/format/formatTime";

interface VideoTrimSliderProps {
  durationSeconds: number;
}

export const VideoTrimSlider: FC<VideoTrimSliderProps> = ({
  durationSeconds,
}) => {
  const { t } = useTranslation();
  const {
    videoTrimStartSeconds,
    trimEnd,
    handleTrimChange,
    handleTrimChangeEnd,
    handleThumbPointerDown,
  } = useVideoTrim(durationSeconds);

  return (
    <Slider
      size="sm"
      label={t("backgroundVideoTrack.trim")}
      step={1}
      minValue={0}
      maxValue={Math.max(1, Math.floor(durationSeconds))}
      value={[videoTrimStartSeconds, trimEnd]}
      renderThumb={(props) => {
        const { index, ...thumbProps } = props;
        return (
          <div
            {...thumbProps}
            onPointerDown={(e) => {
              thumbProps.onPointerDown?.(e);
              handleThumbPointerDown(index ?? 0);
            }}
          />
        );
      }}
      onChange={handleTrimChange}
      onChangeEnd={handleTrimChangeEnd}
      getValue={(v) =>
        Array.isArray(v)
          ? `${formatTime(v[0])} – ${formatTime(v[1])}`
          : formatTime(v)
      }
      getTooltipValue={(v, index) =>
        formatTime(Array.isArray(v) ? v[index ?? 0] : v)
      }
      showTooltip
      classNames={{
        value: "text-xs text-foreground/80",
        label: "text-foreground/80",
      }}
    />
  );
};
