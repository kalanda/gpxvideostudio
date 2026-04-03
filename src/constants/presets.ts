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

/** Google Fonts available in the app (bundled via @remotion/google-fonts). */
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
