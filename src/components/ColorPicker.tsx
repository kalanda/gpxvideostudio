import type { FC } from "react";
import { useState } from "react";
import { CompactPicker } from "react-color";
import { useTranslation } from "react-i18next";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: FC<ColorPickerProps> = ({
  label,
  color,
  onChange,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
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
                onChangeComplete={(c) => onChange(c.hex)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
