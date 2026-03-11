import type { FC } from "react";
import { DataItem } from "@/compositions/widgets/DataItem";
import { formatDateLocal } from "@/utils/format/formatDateLocal";
import { formatTimeLocal } from "@/utils/format/formatTimeLocal";

type DateTimeDisplayProps = {
  date: Date;
};

export const DateTimeDisplay: FC<DateTimeDisplayProps> = (props) => {
  const { date } = props;
  return (
    <DataItem label={formatDateLocal(date)} value={formatTimeLocal(date)} />
  );
};
