const TRANSLATION_KEYS_REGEX =
  /(?<![a-zA-Z])t\s*\(\s*(['"])(.*?)\1\s*,?\s*(?:\{[^}]*\})?\s*,?\s*\)/g;

const TRANSLATION_KEYS_REGEX_WITH_TRANS = /i18nKey\s*=\s*(['"])(.*?)\1/g;

const TRANSLATION_KEY_REGEX = /['"](.+?)['"]/i;
const TRANSLATION_KEYS_REGEX_WITH_TRANS_VALUES = /i18nKey\s*=\s*(['"])(.*?)\1/i;

/**
 * Extracts translation keys from the content
 * @param content - The content to extract translation keys from
 * @param usedKeys - The set of used keys
 */
export const extractUsedKeys = (content: string, usedKeys: Set<string>) => {
  // Look for t(' or t(" patterns which likely indicate translation keys
  const matches = content.match(TRANSLATION_KEYS_REGEX) || [];

  matches.forEach((matchItem) => {
    const keyMatch = TRANSLATION_KEY_REGEX.exec(matchItem);

    if (keyMatch?.[1]) {
      const key = keyMatch[1];
      usedKeys.add(key);
    }
  });

  // Look for i18nKey patterns which likely indicate translation keys
  const matchesWithTrans =
    content.match(TRANSLATION_KEYS_REGEX_WITH_TRANS) || [];

  matchesWithTrans.forEach((matchItem) => {
    const keyMatch = TRANSLATION_KEYS_REGEX_WITH_TRANS_VALUES.exec(matchItem);

    if (keyMatch?.[2]) {
      const key = keyMatch[2];
      usedKeys.add(key);
    }
  });
};
