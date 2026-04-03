export const CUSTOM_PRESET_KEY = "custom" as const;

export type PresetsMap = Record<string, { width: number; height: number }>;

/**
 * Returns the preset key whose width/height match the given dimensions (or swapped).
 * Returns CUSTOM_PRESET_KEY when no preset matches.
 */
export function getMatchingPresetKey(
  width: number,
  height: number,
  presets: PresetsMap,
): string {
  for (const [key, preset] of Object.entries(presets)) {
    if (
      (width === preset.width && height === preset.height) ||
      (width === preset.height && height === preset.width)
    ) {
      return key;
    }
  }
  return CUSTOM_PRESET_KEY;
}
