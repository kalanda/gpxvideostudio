import fs from "node:fs";
import { parse } from "@humanwhocodes/momoa";

export type KeyLocation = {
  file: string;
  line: number;
};

/**
 * Get all the translation keys with their file locations
 * @param options - The options for the function
 * @param options.localesPath - The path to the locales directory
 */
export const getTranslationKeysFromLocaleFile = (options: {
  localeFile: string;
}): Map<string, KeyLocation> => {
  const { localeFile } = options;

  // Map of key to its file location and line number
  const keyLocations = new Map<string, { file: string; line: number }>();

  const content = fs.readFileSync(localeFile, "utf8");
  const ast = parse(content);

  // Recursively traverse the AST to find all key positions
  // biome-ignore lint/suspicious/noExplicitAny: No worries
  const traverse = (node: any, currentPath: string[] = []) => {
    // Handle Document type (root node from momoa)
    if (node.type === "Document") {
      traverse(node.body, currentPath);
      return;
    }

    if (node.type === "Object") {
      // biome-ignore lint/suspicious/noExplicitAny: No worries
      node.members.forEach((member: any) => {
        if (member.type === "Member") {
          const key = member.name.value;
          const newPath = [...currentPath, key];
          const fullKey = newPath.join(".");

          // Only record keys that are at the deepest level (not objects)
          if (member.value.type !== "Object") {
            keyLocations.set(fullKey, {
              file: localeFile,
              line: member.name.loc.start.line,
            });
          }

          // Recursively traverse nested objects
          if (member.value.type === "Object") {
            traverse(member.value, newPath);
          }
        }
      });
    }
  };

  traverse(ast);

  return keyLocations;
};
