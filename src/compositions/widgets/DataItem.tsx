import type { FC, ReactNode } from "react";
import { useWidgetAppearanceStore } from "@/stores/widgetAppearanceStore";

export type DataItemProps = {
  label?: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
};

export const DataItem: FC<DataItemProps> = (props) => {
  const { label, value, unit } = props;
  const { primaryColor, accentColor } = useWidgetAppearanceStore();
  return (
    <div className="flex flex-col items-center py-0.5 px-2">
      {label && (
        <span
          className="text-2xl font-medium tracking-wider uppercase text-shadow-xs"
          style={{ color: primaryColor }}
        >
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-4xl font-bold leading-none text-shadow-xs tabular-nums"
          style={{ color: accentColor }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-2xl font-medium text-shadow-xs"
            style={{ color: primaryColor }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};
