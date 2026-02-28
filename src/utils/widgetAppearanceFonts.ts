import { getAvailableFonts } from "@remotion/google-fonts";
import { PRESET_FONT_FAMILIES } from "@/constants/defaults";

const allFonts = getAvailableFonts();

/** Load only normal style, common weights and latin subset to avoid 80+ network requests per font. */
const FONT_LOAD_OPTIONS: { weights: string[]; subsets: string[] } = {
  weights: ["400", "700"],
  subsets: ["latin"],
};

export type GoogleFontItem = (typeof allFonts)[number];

export async function loadFontByFamily(fontFamily: string): Promise<void> {
  const font = allFonts.find((f) => f.fontFamily === fontFamily);
  if (!font) return;
  const mod = await font.load();
  mod.loadFont("normal", FONT_LOAD_OPTIONS);
}

export function getAllFonts(): GoogleFontItem[] {
  return allFonts;
}

const PRESET_SET = new Set<string>(PRESET_FONT_FAMILIES);

export function getFontsToShow(
  showAllFonts: boolean,
  currentFontFamily: string,
): GoogleFontItem[] {
  if (showAllFonts) return allFonts;
  const byFamily = new Map(allFonts.map((f) => [f.fontFamily, f]));
  const preset = PRESET_FONT_FAMILIES.map((name) => byFamily.get(name)).filter(
    (f): f is GoogleFontItem => f != null,
  );
  if (PRESET_SET.has(currentFontFamily)) return preset;
  const currentFont = byFamily.get(currentFontFamily);
  if (!currentFont) return preset;
  return [currentFont, ...preset];
}

export { PRESET_FONT_FAMILIES };
