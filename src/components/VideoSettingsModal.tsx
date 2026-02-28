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
import {
  FPS_MAX,
  FPS_MIN,
  RESOLUTION_PRESETS,
  type ResolutionPresetKey,
  WIDTH_HEIGHT_MAX,
  WIDTH_HEIGHT_MIN,
} from "@/constants/defaults";
import {
  type VideoSettingsFormValues,
  videoSettingsFormSchema,
} from "@/schemas/videoSettingsSchema";
import { useVideoSettingsStore } from "@/stores/videoSettingsStore";

const PRESET_OPTION_CUSTOM = "custom";

function getMatchingPresetKey(
  width: number,
  height: number,
): ResolutionPresetKey | typeof PRESET_OPTION_CUSTOM {
  for (const [key, preset] of Object.entries(RESOLUTION_PRESETS)) {
    if (
      (width === preset.width && height === preset.height) ||
      (width === preset.height && height === preset.width)
    ) {
      return key as ResolutionPresetKey;
    }
  }
  return PRESET_OPTION_CUSTOM;
}

const PRESET_LABELS: Record<ResolutionPresetKey, string> = {
  "4k": "4K",
  "2k": "2K",
  "1080p": "1080p",
  "720p": "720p",
};

export type VideoSettingsModalProps = {
  isOpen: boolean;
  onFinish: () => void;
};

export const VideoSettingsModal: FC<VideoSettingsModalProps> = (props) => {
  const { isOpen, onFinish } = props;
  const { width, height, fps, setWidth, setHeight, setFps } =
    useVideoSettingsStore();

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
  );

  const applyPreset = (key: ResolutionPresetKey) => {
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
          Video settings
        </ModalHeader>
        <ModalBody>
          <Select
            label="Preset"
            selectedKeys={[currentPresetKey]}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              if (key && key !== PRESET_OPTION_CUSTOM) {
                applyPreset(key as ResolutionPresetKey);
              }
            }}
            aria-label="Resolution preset"
          >
            <SelectItem key={PRESET_OPTION_CUSTOM} textValue="Custom">
              Custom
            </SelectItem>
            <SelectItem key="4k" textValue={PRESET_LABELS["4k"]}>
              {PRESET_LABELS["4k"]}
            </SelectItem>
            <SelectItem key="2k" textValue={PRESET_LABELS["2k"]}>
              {PRESET_LABELS["2k"]}
            </SelectItem>
            <SelectItem key="1080p" textValue={PRESET_LABELS["1080p"]}>
              {PRESET_LABELS["1080p"]}
            </SelectItem>
            <SelectItem key="720p" textValue={PRESET_LABELS["720p"]}>
              {PRESET_LABELS["720p"]}
            </SelectItem>
          </Select>

          <div className="flex gap-2 items-start">
            <Controller
              name="width"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  label="Width"
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
              <Tooltip content="Swap width and height">
                <Button
                  isIconOnly
                  variant="flat"
                  aria-label="Swap width and height"
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
                  label="Height"
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
                label="FPS"
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
            Cancel
          </Button>
          <Button color="primary" onPress={() => onSubmit()}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
