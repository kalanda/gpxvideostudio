import {
  Autocomplete,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { Palette } from "lucide-react";
import { useState } from "react";
import { CompactPicker } from "react-color";
import { useFontSelector } from "@/hooks/useFontSelector";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";

export const WidgetAppearanceDropdown = () => {
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
              label="Fuente"
              placeholder={showAllFonts ? "Buscar en todas las fuentes…" : "Elegir fuente"}
              selectedKey={fontFamily}
              onSelectionChange={onSelectionChange}
              size="sm"
              classNames={{ base: "w-full" }}
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
          {colorPickerSection("Primary color", primaryColor, setPrimaryColor, primaryColorPickerOpen, setPrimaryColorPickerOpen)}
          {colorPickerSection("Accent color", accentColor, setAccentColor, accentColorPickerOpen, setAccentColorPickerOpen)}
        </div>
      </PopoverContent>
    </Popover>
  );
};
