import { AutocompleteItem } from "@heroui/react";
import type { Key } from "react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import {
  getFontsToShow,
  loadFontByFamily,
  PRESET_FONT_FAMILIES,
} from "@/utils/widgetAppearanceFonts";

export function useFontSelector() {
  const { fontFamily, setFontFamily } = useWidgetAppearanceStore(
    useShallow((s) => ({ fontFamily: s.fontFamily, setFontFamily: s.setFontFamily })),
  );
  const [showAllFonts, setShowAllFonts] = useState(false);

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

  const fontsToShow = getFontsToShow(showAllFonts, fontFamily);
  const fontItems = fontsToShow.map((f) => (
    <AutocompleteItem key={f.fontFamily} textValue={f.fontFamily}>
      <span style={{ fontFamily: `${f.fontFamily}, sans-serif` }}>
        {f.fontFamily}
      </span>
    </AutocompleteItem>
  ));

  return {
    fontFamily,
    fontItems,
    onSelectionChange,
    showAllFonts,
    setShowAllFonts,
  };
}
