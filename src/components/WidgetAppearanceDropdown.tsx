import {
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
} from "@heroui/react";
import { Palette } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { ColorPicker } from "@/components/ColorPicker";
import { useFontSelector } from "@/hooks/useFontSelector";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import {
  MapBearingMode,
  MapPitch,
  MapTheme,
  MapViewportMode,
} from "@/types/map";

export const WidgetAppearanceDropdown = () => {
  const { t } = useTranslation();
  const { fontFamily, fontItems, onSelectionChange } = useFontSelector();
  const {
    accentColor,
    setAccentColor,
    primaryColor,
    setPrimaryColor,
    mapTheme,
    setMapTheme,
    mapBearingMode,
    setMapBearingMode,
    mapViewportMode,
    setMapViewportMode,
    mapPitch,
    setMapPitch,
  } = useWidgetAppearanceStore(
    useShallow((s) => ({
      accentColor: s.accentColor,
      setAccentColor: s.setAccentColor,
      primaryColor: s.primaryColor,
      setPrimaryColor: s.setPrimaryColor,
      mapTheme: s.mapTheme,
      setMapTheme: s.setMapTheme,
      mapBearingMode: s.mapBearingMode,
      setMapBearingMode: s.setMapBearingMode,
      mapViewportMode: s.mapViewportMode,
      setMapViewportMode: s.setMapViewportMode,
      mapPitch: s.mapPitch,
      setMapPitch: s.setMapPitch,
    })),
  );
  return (
    <Popover placement="bottom-start" showArrow>
      <PopoverTrigger>
        <Button
          size="sm"
          variant="flat"
          aria-label={t("appearance.ariaLabel")}
          startContent={<Palette size={16} />}
        >
          {t("appearance.buttonLabel")}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3 px-1 py-2">
          <div className="flex flex-col gap-1">
            <Select
              label={t("appearance.fontLabel")}
              selectedKeys={[fontFamily]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0];
                if (typeof v === "string") void onSelectionChange(v);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              {fontItems}
            </Select>
          </div>
          <ColorPicker
            label={t("appearance.primaryColorLabel")}
            color={primaryColor}
            onChange={setPrimaryColor}
          />
          <ColorPicker
            label={t("appearance.accentColorLabel")}
            color={accentColor}
            onChange={setAccentColor}
          />
          <Divider />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground-500">
              {t("appearance.mapAppearanceSection")}
            </span>
            <Select
              label={t("appearance.mapThemeLabel")}
              selectedKeys={[mapTheme]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as MapTheme | undefined;
                if (v != null && Object.values(MapTheme).includes(v))
                  setMapTheme(v);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              <SelectItem key={MapTheme.None}>
                {t("appearance.mapThemes.none")}
              </SelectItem>
              <SelectItem key={MapTheme.Light}>
                {t("appearance.mapThemes.light")}
              </SelectItem>
              <SelectItem key={MapTheme.Dark}>
                {t("appearance.mapThemes.dark")}
              </SelectItem>
              <SelectItem key={MapTheme.Colored}>
                {t("appearance.mapThemes.colored")}
              </SelectItem>
              <SelectItem key={MapTheme.Satellite}>
                {t("appearance.mapThemes.satellite")}
              </SelectItem>
            </Select>
            <Select
              label={t("appearance.mapViewportLabel")}
              selectedKeys={[mapViewportMode]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as MapViewportMode | undefined;
                if (v != null && Object.values(MapViewportMode).includes(v))
                  setMapViewportMode(v);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              <SelectItem key={MapViewportMode.FullRoute}>
                {t("appearance.mapViewportModes.fullRoute")}
              </SelectItem>
              <SelectItem key={MapViewportMode.FollowPoint}>
                {t("appearance.mapViewportModes.followPoint")}
              </SelectItem>
            </Select>
            <Select
              label={t("appearance.mapCameraLabel")}
              selectedKeys={[String(mapPitch)]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0];
                setMapPitch(v as MapPitch);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              <SelectItem key={String(MapPitch.TopDown)}>
                {t("appearance.mapPitchModes.topDown")}
              </SelectItem>
              <SelectItem key={String(MapPitch.Tilted)}>
                {t("appearance.mapPitchModes.tilted")}
              </SelectItem>
            </Select>
            <Select
              label={t("appearance.mapBearingLabel")}
              selectedKeys={[mapBearingMode]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as MapBearingMode | undefined;
                if (v != null && Object.values(MapBearingMode).includes(v))
                  setMapBearingMode(v);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              <SelectItem key={MapBearingMode.Fixed}>
                {t("appearance.mapBearingModes.fixed")}
              </SelectItem>
              <SelectItem key={MapBearingMode.Dynamic}>
                {t("appearance.mapBearingModes.dynamic")}
              </SelectItem>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
