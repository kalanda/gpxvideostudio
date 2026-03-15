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
import { useShallow } from "zustand/react/shallow";
import { useFontSelector } from "@/hooks/useFontSelector";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import {
  MapBearingMode,
  MapPitch,
  MapTheme,
  MapViewportMode,
} from "@/types/map";

const MAP_THEME_LABELS: Record<MapTheme, string> = {
  [MapTheme.None]: "None",
  [MapTheme.Light]: "Light",
  [MapTheme.Dark]: "Dark",
  [MapTheme.Colored]: "Colored",
  [MapTheme.Satellite]: "Satellite",
};

const BEARING_MODE_LABELS: Record<MapBearingMode, string> = {
  [MapBearingMode.Fixed]: "Fixed",
  [MapBearingMode.Dynamic]: "Dynamic",
};

const VIEWPORT_MODE_LABELS: Record<MapViewportMode, string> = {
  [MapViewportMode.FullRoute]: "Full Route",
  [MapViewportMode.FollowPoint]: "Follow Point",
};

const PITCH_LABELS: Record<MapPitch, string> = {
  [MapPitch.TopDown]: "Top Down",
  [MapPitch.Tilted]: "Tilted",
};

export const WidgetAppearanceDropdown = () => {
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
          aria-label={`Choose ${label}`}
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
          aria-label="Appearance settings"
          startContent={<Palette size={16} />}
        >
          Appearance
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3 px-1 py-2">
          <div className="flex flex-col gap-1">
            <Autocomplete
              label="Font"
              placeholder={showAllFonts ? "Search all fonts…" : "Select font"}
              selectedKey={fontFamily}
              onSelectionChange={onSelectionChange}
              size="sm"
              classNames={{ base: "w-full" }}
              listboxProps={{ emptyContent: "No results" }}
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
              {showAllFonts ? "Show only recommended fonts" : "Show all fonts"}
            </Button>
          </div>
          {colorPickerSection(
            "Primary color",
            primaryColor,
            setPrimaryColor,
            primaryColorPickerOpen,
            setPrimaryColorPickerOpen,
          )}
          {colorPickerSection(
            "Accent color",
            accentColor,
            setAccentColor,
            accentColorPickerOpen,
            setAccentColorPickerOpen,
          )}
          <Divider />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground-500">
              Map appearance
            </span>
            <Select
              label="Theme"
              selectedKeys={[mapTheme]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as MapTheme | undefined;
                if (v != null && Object.values(MapTheme).includes(v))
                  setMapTheme(v);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              {Object.values(MapTheme).map((t) => (
                <SelectItem key={t}>{MAP_THEME_LABELS[t]}</SelectItem>
              ))}
            </Select>
            <Select
              label="Viewport"
              selectedKeys={[mapViewportMode]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as MapViewportMode | undefined;
                if (v != null && Object.values(MapViewportMode).includes(v))
                  setMapViewportMode(v);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              {Object.values(MapViewportMode).map((m) => (
                <SelectItem key={m}>{VIEWPORT_MODE_LABELS[m]}</SelectItem>
              ))}
            </Select>
            <Select
              label="Camera"
              selectedKeys={[String(mapPitch)]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0];
                setMapPitch(v as MapPitch);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              {Object.values(MapPitch).map((p) => (
                <SelectItem key={String(p)}>{PITCH_LABELS[p]}</SelectItem>
              ))}
            </Select>
            <Select
              label="Bearing"
              selectedKeys={[mapBearingMode]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as MapBearingMode | undefined;
                if (v != null && Object.values(MapBearingMode).includes(v))
                  setMapBearingMode(v);
              }}
              size="sm"
              classNames={{ base: "w-full" }}
            >
              {Object.values(MapBearingMode).map((b) => (
                <SelectItem key={b}>{BEARING_MODE_LABELS[b]}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
