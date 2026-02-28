import { z } from "zod";
import {
  FPS_MAX,
  FPS_MIN,
  WIDTH_HEIGHT_MAX,
  WIDTH_HEIGHT_MIN,
} from "@/constants/defaults";

export const videoSettingsFormSchema = z.object({
  width: z.number().int().min(WIDTH_HEIGHT_MIN).max(WIDTH_HEIGHT_MAX),
  height: z.number().int().min(WIDTH_HEIGHT_MIN).max(WIDTH_HEIGHT_MAX),
  fps: z.number().int().min(FPS_MIN).max(FPS_MAX),
});

export type VideoSettingsFormValues = z.infer<typeof videoSettingsFormSchema>;
