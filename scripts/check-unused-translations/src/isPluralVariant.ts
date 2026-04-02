/**
 * Check if a key is a plural variant
 * @param key - The key to check
 * @returns True if the key is a plural variant, false otherwise
 */
export const isPluralVariant = (key: string): boolean => {
  const pluralSuffixes = ['_one', '_other', '_zero', '_few', '_many', '_two'];
  return pluralSuffixes.some((suffix) => key.endsWith(suffix));
};
