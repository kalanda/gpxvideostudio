import { AutocompleteItem } from "@heroui/react";
import type { Key } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";
import {
  getFontsToShow,
  loadFontByFamily,
  PRESET_FONT_FAMILIES,
} from "@/utils/widgetAppearanceFonts";

export function useFontSelector() {
  const { fontFamily, setFontFamily } = useWidgetAppearanceStore();
  const [showAllFonts, setShowAllFonts] = useState(false);

  useEffect(() => {
    void loadFontByFamily(fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    PRESET_FONT_FAMILIES.forEach((name) => void loadFontByFamily(name));
  }, []);

  const onSelectionChange = useCallback(
    async (key: Key | null) => {
      if (key == null || typeof key !== "string") return;
      setFontFamily(key);
      await loadFontByFamily(key);
    },
    [setFontFamily],
  );

  const fontsToShow = useMemo(
    () => getFontsToShow(showAllFonts, fontFamily),
    [showAllFonts, fontFamily],
  );

  const fontItems = useMemo(
    () =>
      fontsToShow.map((f) => (
        <AutocompleteItem key={f.fontFamily} textValue={f.fontFamily}>
          <span style={{ fontFamily: `${f.fontFamily}, sans-serif` }}>
            {f.fontFamily}
          </span>
        </AutocompleteItem>
      )),
    [fontsToShow],
  );

  return {
    fontFamily,
    fontItems,
    onSelectionChange,
    showAllFonts,
    setShowAllFonts,
  };
}
