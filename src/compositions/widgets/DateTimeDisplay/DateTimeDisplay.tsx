import type { FC } from "react";
import { DataItem } from "@/compositions/widgets/DataItem";
import {
  formatDateLocal,
  formatTimeLocal,
} from "@/utils/format/formatDateTimeLocal";

type DateTimeDisplayProps = {
  date: Date;
};

export const DateTimeDisplay: FC<DateTimeDisplayProps> = (props) => {
  const { date } = props;
  return <DataItem label={formatDateLocal(date)} value={formatTimeLocal(date)} />;
};
