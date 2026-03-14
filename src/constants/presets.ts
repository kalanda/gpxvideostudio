import { VideoBitrate } from "@/types/video";

/** Common video resolution presets: 4K, 2K, Full HD, HD */
export const RESOLUTION_PRESETS = {
  "4k": { width: 3840, height: 2160 },
  "2k": { width: 2560, height: 1440 },
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
} as const;

export const VIDEO_BITRATE_PRESETS: VideoBitrate[] = [
  VideoBitrate.VeryLow,
  VideoBitrate.Low,
  VideoBitrate.Medium,
  VideoBitrate.High,
  VideoBitrate.VeryHigh,
] as const;

export const VIDEO_BITRATE_LABELS: Record<VideoBitrate, string> = {
  [VideoBitrate.VeryLow]: "Very low",
  [VideoBitrate.Low]: "Low",
  [VideoBitrate.Medium]: "Medium",
  [VideoBitrate.High]: "High",
  [VideoBitrate.VeryHigh]: "Very high",
} as const;

/** Subset of Google Fonts shown by default (legible, versatile). Use the "Show all" option to search the full catalog. */
export const PRESET_FONT_FAMILIES = [
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Poppins",
  "Oswald",
  "Raleway",
  "Playfair Display",
  "Lora",
  "Work Sans",
] as const;
