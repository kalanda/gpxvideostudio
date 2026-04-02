/**
 * Get the base key from a plural key (e.g., "totalHouses_one" -> "totalHouses")
 * @param key - The key to get the base key from
 * @returns The base key
 */
export const getBaseKey = (key: string): string => {
  // Check if the key ends with a plural suffix (_one, _other, _zero, _few, _many, etc.)
  const pluralSuffixes = ['_one', '_other', '_zero', '_few', '_many', '_two'];
  for (const suffix of pluralSuffixes) {
    if (key.endsWith(suffix)) {
      return key.slice(0, -suffix.length);
    }
  }
  return key;
};
