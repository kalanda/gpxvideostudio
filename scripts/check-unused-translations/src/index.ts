import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { getBaseKey } from "./getBaseKey";
import {
  getTranslationKeysFromLocaleFile,
  type KeyLocation,
} from "./getTranslationKeysFromLocaleFile";
import { getTranslationKeysUsed } from "./getTranslationKeysUsed";
import { parseCommandLineArguments } from "./parseCommandLineArguments";

// Parse arguments
const { srcPath, localeFile, whitelistFile } = parseCommandLineArguments<
  "srcPath" | "localeFile" | "whitelistFile"
>({
  argv: process.argv,
});

// WhitelistFile is optional
if (!srcPath || !localeFile) {
  console.error(
    "Error: --srcPath, --localeFile and --whitelistFile are required",
  );
  console.error(
    "Usage: tsx index.ts --srcPath <path> --localeFile <path> [--whitelistFile <path>]",
  );
  process.exit(1);
}

// check if srcPath and localesPath are valid
if (!fs.existsSync(srcPath)) {
  console.error(`Source path "${srcPath}" does not exist`);
  process.exit(1);
}
if (!fs.existsSync(localeFile)) {
  console.error(`Locale file "${localeFile}" does not exist`);
  process.exit(1);
}

// Read the list of keys that are whitelisted from being checked for unused translations
let whitelist: { whitelistKeys: string[] } = { whitelistKeys: [] };
if (whitelistFile) {
  whitelist = JSON.parse(fs.readFileSync(whitelistFile, "utf8")) as {
    whitelistKeys: string[];
  };
}

const keyWithLocations = getTranslationKeysFromLocaleFile({ localeFile });
const usedKeys = getTranslationKeysUsed({ srcPath });
const unusedKeys = new Map<string, KeyLocation>();
const unusedButWhitelistedKeys = new Map<string, KeyLocation>();

// Iterate over the keys and check if they are used
for (const key of keyWithLocations.keys()) {
  const baseKey = getBaseKey(key);
  const isUsed = usedKeys.includes(baseKey);
  const isWhitelisted = whitelist.whitelistKeys.some((pattern) => {
    // Convert glob pattern to regex
    const regexPattern = pattern.replace(".", "\\.").replace("*", ".*");
    return new RegExp(`^${regexPattern}$`).test(key);
  });

  if (!isUsed && !isWhitelisted) {
    unusedKeys.set(key, keyWithLocations.get(key) || { file: "", line: 0 });
  } else if (isWhitelisted) {
    unusedButWhitelistedKeys.set(
      key,
      keyWithLocations.get(key) || { file: "", line: 0 },
    );
  }
}

// Print the unused but whitelisted keys
for (const [key] of unusedButWhitelistedKeys.entries()) {
  console.info(`🛡️ Key "${key}" is whitelisted`);
}

// Print the unused keys
for (const [key, location] of unusedKeys.entries()) {
  const absoluteLocationFile = path.resolve(process.cwd(), location.file);
  console.info(
    `❌ Key "${key}" is unused at (${absoluteLocationFile}:${location.line})`,
  );
}

if (unusedKeys.size === 0) {
  console.info(`🎉 No unused translation keys found at ${localeFile}!`);
  process.exit(0);
} else {
  console.info(
    `\nFound ${unusedKeys.size} unused translation keys at ${localeFile}`,
  );
  process.exit(1);
}
