import { SelectItem } from "@heroui/react";
import type { Key } from "react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import {
  getPresetFonts,
  loadFontByFamily,
  PRESET_FONT_FAMILIES,
} from "@/utils/widgetAppearanceFonts";

export function useFontSelector() {
  const { fontFamily, setFontFamily } = useWidgetAppearanceStore(
    useShallow((s) => ({
      fontFamily: s.fontFamily,
      setFontFamily: s.setFontFamily,
    })),
  );

  useEffect(() => {
    void loadFontByFamily(fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    PRESET_FONT_FAMILIES.forEach((name) => void loadFontByFamily(name));
  }, []);

  async function onSelectionChange(key: Key | null) {
    if (key == null || typeof key !== "string") return;
    setFontFamily(key);
    await loadFontByFamily(key);
  }

  const fontsToShow = getPresetFonts();
  const fontItems = fontsToShow.map((f) => (
    <SelectItem key={f.fontFamily} textValue={f.fontFamily}>
      <span style={{ fontFamily: `${f.fontFamily}, sans-serif` }}>
        {f.fontFamily}
      </span>
    </SelectItem>
  ));

  return {
    fontFamily,
    fontItems,
    onSelectionChange,
  };
}
