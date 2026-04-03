import * as Lato from "@remotion/google-fonts/Lato";
import * as Lora from "@remotion/google-fonts/Lora";
import * as Montserrat from "@remotion/google-fonts/Montserrat";
import * as OpenSans from "@remotion/google-fonts/OpenSans";
import * as Oswald from "@remotion/google-fonts/Oswald";
import * as PlayfairDisplay from "@remotion/google-fonts/PlayfairDisplay";
import * as Poppins from "@remotion/google-fonts/Poppins";
import * as Raleway from "@remotion/google-fonts/Raleway";
import * as Roboto from "@remotion/google-fonts/Roboto";
import * as WorkSans from "@remotion/google-fonts/WorkSans";
import { PRESET_FONT_FAMILIES } from "@/constants/presets";

/** Remotion font modules differ in their generated `getInfo()` types; only `loadFont` is used here. */
type GoogleFontModule = {
  loadFont: (
    style: string,
    options: { weights: string[]; subsets: string[] },
  ) => unknown;
};

const FONT_MODULE_BY_FAMILY: Record<
  (typeof PRESET_FONT_FAMILIES)[number],
  GoogleFontModule
> = {
  Roboto: Roboto as GoogleFontModule,
  "Open Sans": OpenSans as GoogleFontModule,
  Montserrat: Montserrat as GoogleFontModule,
  Lato: Lato as GoogleFontModule,
  Poppins: Poppins as GoogleFontModule,
  Oswald: Oswald as GoogleFontModule,
  Raleway: Raleway as GoogleFontModule,
  "Playfair Display": PlayfairDisplay as GoogleFontModule,
  Lora: Lora as GoogleFontModule,
  "Work Sans": WorkSans as GoogleFontModule,
};

/** Load only normal style, common weights and latin subset to avoid 80+ network requests per font. */
const FONT_LOAD_OPTIONS: { weights: string[]; subsets: string[] } = {
  weights: ["400", "700"],
  subsets: ["latin"],
};

export type PresetFontItem = {
  fontFamily: (typeof PRESET_FONT_FAMILIES)[number];
};

export function getPresetFonts(): PresetFontItem[] {
  return PRESET_FONT_FAMILIES.map((fontFamily) => ({ fontFamily }));
}

export async function loadFontByFamily(fontFamily: string): Promise<void> {
  const mod =
    FONT_MODULE_BY_FAMILY[fontFamily as keyof typeof FONT_MODULE_BY_FAMILY];
  if (!mod) return;
  mod.loadFont("normal", FONT_LOAD_OPTIONS);
}

export { PRESET_FONT_FAMILIES };
