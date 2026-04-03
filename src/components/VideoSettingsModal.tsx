import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tooltip,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, Settings } from "lucide-react";
import type { FC } from "react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import {
  FPS_MAX,
  FPS_MIN,
  WIDTH_HEIGHT_MAX,
  WIDTH_HEIGHT_MIN,
} from "@/constants/config";
import { RESOLUTION_PRESETS } from "@/constants/presets";
import {
  type VideoSettingsFormValues,
  videoSettingsFormSchema,
} from "@/schemas/videoSettingsSchema";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import {
  CUSTOM_PRESET_KEY,
  getMatchingPresetKey,
} from "@/utils/video/getMatchingPresetKey";

export type VideoSettingsModalProps = {
  isOpen: boolean;
  onFinish: () => void;
};

export const VideoSettingsModal: FC<VideoSettingsModalProps> = (props) => {
  const { t } = useTranslation();
  const { isOpen, onFinish } = props;
  const { width, height, fps, setWidth, setHeight, setFps } =
    useProjectVideoSettingsStore(
      useShallow((s) => ({
        width: s.width,
        height: s.height,
        fps: s.fps,
        setWidth: s.setWidth,
        setHeight: s.setHeight,
        setFps: s.setFps,
      })),
    );

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VideoSettingsFormValues>({
    resolver: zodResolver(videoSettingsFormSchema),
    mode: "onChange",
    defaultValues: {
      width,
      height,
      fps,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ width, height, fps });
    }
  }, [isOpen, width, height, fps, reset]);

  const watchedWidth = useWatch({ control, name: "width" });
  const watchedHeight = useWatch({ control, name: "height" });

  const onSubmit = handleSubmit((data) => {
    setWidth(data.width);
    setHeight(data.height);
    setFps(data.fps);
    onFinish?.();
  });

  const currentPresetKey = getMatchingPresetKey(
    Number(watchedWidth),
    Number(watchedHeight),
    RESOLUTION_PRESETS,
  );

  const applyPreset = (key: keyof typeof RESOLUTION_PRESETS) => {
    const preset = RESOLUTION_PRESETS[key];
    setValue("width", preset.width);
    setValue("height", preset.height);
  };

  const handleRotate = () => {
    const w = Number(watchedWidth);
    const h = Number(watchedHeight);
    if (typeof w !== "number" || typeof h !== "number") return;
    setValue("width", h);
    setValue("height", w);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onFinish?.()}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Settings size={20} />
          {t("videoSettings.title")}
        </ModalHeader>
        <ModalBody>
          <Select
            label={t("videoSettings.presetLabel")}
            selectedKeys={[currentPresetKey]}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              if (key && key !== CUSTOM_PRESET_KEY) {
                applyPreset(key as keyof typeof RESOLUTION_PRESETS);
              }
            }}
            aria-label={t("videoSettings.presetAriaLabel")}
          >
            <SelectItem
              key={CUSTOM_PRESET_KEY}
              textValue={t("videoSettings.presetCustom")}
            >
              {t("videoSettings.presetCustom")}
            </SelectItem>
            <SelectItem key="4k" textValue={t("videoSettings.presets.4k")}>
              {t("videoSettings.presets.4k")}
            </SelectItem>
            <SelectItem key="2k" textValue={t("videoSettings.presets.2k")}>
              {t("videoSettings.presets.2k")}
            </SelectItem>
            <SelectItem
              key="1080p"
              textValue={t("videoSettings.presets.1080p")}
            >
              {t("videoSettings.presets.1080p")}
            </SelectItem>
            <SelectItem key="720p" textValue={t("videoSettings.presets.720p")}>
              {t("videoSettings.presets.720p")}
            </SelectItem>
          </Select>

          <div className="flex gap-2 items-start">
            <Controller
              name="width"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  label={t("videoSettings.widthLabel")}
                  value={field.value == null ? "" : String(field.value)}
                  min={WIDTH_HEIGHT_MIN}
                  max={WIDTH_HEIGHT_MAX}
                  onValueChange={(v) => {
                    const n = v === "" ? 0 : Number(v);
                    field.onChange(Number.isNaN(n) ? 0 : n);
                  }}
                  onBlur={field.onBlur}
                  isInvalid={!!errors.width}
                  errorMessage={errors.width?.message}
                  className="flex-1"
                />
              )}
            />
            <div className="pt-3">
              <Tooltip content={t("videoSettings.swapWidthHeight")}>
                <Button
                  isIconOnly
                  variant="flat"
                  aria-label={t("videoSettings.swapWidthHeight")}
                  onPress={handleRotate}
                  size="sm"
                >
                  <ArrowRightLeft size={18} />
                </Button>
              </Tooltip>
            </div>
            <Controller
              name="height"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  label={t("videoSettings.heightLabel")}
                  value={field.value == null ? "" : String(field.value)}
                  min={WIDTH_HEIGHT_MIN}
                  max={WIDTH_HEIGHT_MAX}
                  onValueChange={(v) => {
                    const n = v === "" ? 0 : Number(v);
                    field.onChange(Number.isNaN(n) ? 0 : n);
                  }}
                  onBlur={field.onBlur}
                  isInvalid={!!errors.height}
                  errorMessage={errors.height?.message}
                  className="flex-1"
                />
              )}
            />
          </div>
          <Controller
            name="fps"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                label={t("videoSettings.fpsLabel")}
                value={field.value == null ? "" : String(field.value)}
                min={FPS_MIN}
                max={FPS_MAX}
                onValueChange={(v) => {
                  const n = v === "" ? 0 : Number(v);
                  field.onChange(Number.isNaN(n) ? 0 : n);
                }}
                onBlur={field.onBlur}
                isInvalid={!!errors.fps}
                errorMessage={errors.fps?.message}
              />
            )}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onFinish?.()}>
            {t("videoSettings.cancel")}
          </Button>
          <Button color="primary" onPress={() => onSubmit()}>
            {t("videoSettings.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
