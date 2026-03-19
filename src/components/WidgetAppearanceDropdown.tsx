import {
  Autocomplete,
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
} from "@heroui/react";
import { Palette } from "lucide-react";
import { useState } from "react";
import { CompactPicker } from "react-color";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
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
  const {
    fontFamily,
    fontItems,
    onSelectionChange,
    showAllFonts,
    setShowAllFonts,
  } = useFontSelector();
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
  const [accentColorPickerOpen, setAccentColorPickerOpen] = useState(false);
  const [primaryColorPickerOpen, setPrimaryColorPickerOpen] = useState(false);

  const colorPickerSection = (
    label: string,
    color: string,
    setColor: (c: string) => void,
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  ) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-foreground-500">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-8 w-full max-w-full rounded-small border border-default-200 bg-default-100 px-2 shadow-sm transition-colors hover:border-default-400"
          style={{ backgroundColor: color }}
          aria-label={t("appearance.chooseColor", { label })}
        />
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-full z-20 mt-1">
              <CompactPicker
                color={color}
                onChangeComplete={(c) => setColor(c.hex)}
              />
            </div>
          </>
        )}
      </div>
    </div>
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
            <Autocomplete
              label={t("appearance.fontLabel")}
              placeholder={
                showAllFonts
                  ? t("appearance.fontSearchPlaceholder")
                  : t("appearance.fontSelectPlaceholder")
              }
              selectedKey={fontFamily}
              onSelectionChange={onSelectionChange}
              size="sm"
              classNames={{ base: "w-full" }}
              listboxProps={{ emptyContent: t("appearance.fontNoResults") }}
              isVirtualized={showAllFonts}
              scrollShadowProps={{ isEnabled: false }}
            >
              {fontItems}
            </Autocomplete>
            <Button
              size="sm"
              variant="light"
              className="w-full justify-start text-foreground-500"
              onPress={() => setShowAllFonts((v) => !v)}
            >
              {showAllFonts
                ? t("appearance.showRecommendedFonts")
                : t("appearance.showAllFonts")}
            </Button>
          </div>
          {colorPickerSection(
            t("appearance.primaryColorLabel"),
            primaryColor,
            setPrimaryColor,
            primaryColorPickerOpen,
            setPrimaryColorPickerOpen,
          )}
          {colorPickerSection(
            t("appearance.accentColorLabel"),
            accentColor,
            setAccentColor,
            accentColorPickerOpen,
            setAccentColorPickerOpen,
          )}
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
