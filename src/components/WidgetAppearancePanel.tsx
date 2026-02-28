import { Autocomplete, Button } from "@heroui/react";
import { useCallback, useState } from "react";
import { CompactPicker } from "react-color";
import { MiniCard } from "@/components/MiniCard";
import { useFontSelector } from "@/hooks/useFontSelector";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";

export const WidgetAppearancePanel = () => {
  const {
    fontFamily,
    fontItems,
    onSelectionChange,
    showAllFonts,
    setShowAllFonts,
  } = useFontSelector();
  const { accentColor, setAccentColor, primaryColor, setPrimaryColor } =
    useWidgetAppearanceStore();
  const [accentColorPickerOpen, setAccentColorPickerOpen] = useState(false);
  const [primaryColorPickerOpen, setPrimaryColorPickerOpen] = useState(false);

  const closeAccent = useCallback(() => setAccentColorPickerOpen(false), []);
  const closePrimary = useCallback(() => setPrimaryColorPickerOpen(false), []);

  return (
    <MiniCard title="Widgets appearance">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Autocomplete
            label="Fuente"
            placeholder={
              showAllFonts ? "Buscar en todas las fuentes…" : "Elegir fuente"
            }
            selectedKey={fontFamily}
            onSelectionChange={onSelectionChange}
            size="sm"
            classNames={{ base: "max-w-xs" }}
            listboxProps={{ emptyContent: "Sin resultados" }}
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
            {showAllFonts ? "Ver solo recomendadas" : "Mostrar todas"}
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-small text-foreground-500">Accent color</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccentColorPickerOpen((open) => !open)}
              className="h-8 w-full max-w-8 rounded-small border border-default-200 bg-default-100 px-2 shadow-sm transition-colors hover:border-default-400"
              style={{ backgroundColor: accentColor }}
              aria-label="Choose accent color"
            />
            {accentColorPickerOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={closeAccent} />
                <div className="absolute left-0 top-full z-20 mt-1">
                  <CompactPicker
                    color={accentColor}
                    onChangeComplete={(color) => setAccentColor(color.hex)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-small text-foreground-500">Primary color</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPrimaryColorPickerOpen((open) => !open)}
              className="h-8 w-full max-w-8 rounded-small border border-default-200 bg-default-100 px-2 shadow-sm transition-colors hover:border-default-400"
              style={{ backgroundColor: primaryColor }}
              aria-label="Choose primary color"
            />
            {primaryColorPickerOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={closePrimary} />
                <div className="absolute left-0 top-full z-20 mt-1">
                  <CompactPicker
                    color={primaryColor}
                    onChangeComplete={(color) => setPrimaryColor(color.hex)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MiniCard>
  );
};
