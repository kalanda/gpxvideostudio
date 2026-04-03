import fs from "node:fs";
import { globSync } from "glob";
import { extractUsedKeys } from "./extractUsedKeys";

/**
 * Get the translation keys used in the source code
 * @param options - The options for the function
 * @param options.srcPath - The path to the source code
 */
export const getTranslationKeysUsed = (options: {
  srcPath: string;
  fileExtensions?: string[];
}) => {
  const { srcPath, fileExtensions = ["ts", "tsx"] } = options;
  const usedKeys = new Set<string>();
  const files = globSync(`${srcPath}/**/*.{${fileExtensions.join(",")}}`);

  files.forEach((file) => {
    extractUsedKeys(fs.readFileSync(file, "utf8"), usedKeys);
  });

  return Array.from(usedKeys);
};
