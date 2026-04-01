import { format } from "date-fns";

export function buildExportArtifactBasename(
  prefix: string,
  date: Date,
): string {
  return `${prefix}-${format(date, "yyyyMMdd-HHmmss")}`;
}
