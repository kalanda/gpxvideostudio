import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): {
  localesDir: string;
  referenceLocale: string;
  ignore: string[];
} {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (!value || value.startsWith("--")) {
        console.error(`Error: Missing value for argument ${arg}`);
        process.exit(1);
      }
      parsed[key] = value;
      i++;
    }
  }

  if (!parsed.localesDir || !parsed.referenceLocale) {
    console.error(
      "Usage: tsx src/index.ts --localesDir <path> --referenceLocale <locale> [--ignore <patterns>]",
    );
    console.error("");
    console.error(
      "  --localesDir        Root directory to scan for locale files",
    );
    console.error('  --referenceLocale   Reference locale name (e.g. "es-ES")');
    console.error(
      '  --ignore            Comma-separated file patterns to ignore (e.g. "tenant-*,whitelist.json")',
    );
    console.error("");
    console.error("Supported directory structures:");
    console.error(
      "  A) Module locales:   <dir>/<module>/locales/<locale>.json",
    );
    console.error("  B) Language folders: <dir>/<locale>/<file>.json");
    console.error("");
    console.error("Examples:");
    console.error(
      "  tsx src/index.ts --localesDir packages/modules/src/webcomponents --referenceLocale es-ES",
    );
    console.error(
      '  tsx src/index.ts --localesDir apps/consumer/src/locales --referenceLocale es-ES --ignore "tenant-*"',
    );
    console.error(
      "  tsx src/index.ts --localesDir apps/customer/dictionaries --referenceLocale es-ES",
    );
    process.exit(1);
  }

  const ignore = parsed.ignore
    ? parsed.ignore.split(",").map((p) => p.trim())
    : [];

  return {
    localesDir: parsed.localesDir,
    referenceLocale: parsed.referenceLocale,
    ignore,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively extract all leaf-level key paths from a JSON object.
 * Nested objects produce dot-separated paths (e.g. "a.b.c").
 */
function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

/**
 * Recursively find all directories named "locales" under `dir`.
 */
function findLocalesDirs(dir: string): string[] {
  const results: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.name === "locales") {
      results.push(fullPath);
    } else {
      results.push(...findLocalesDirs(fullPath));
    }
  }

  return results.sort();
}

/**
 * Check if a filename matches any of the ignore patterns.
 * Supports simple glob patterns with * wildcard.
 */
function shouldIgnore(filename: string, ignorePatterns: string[]): boolean {
  return ignorePatterns.some((pattern) => {
    const regex = new RegExp(
      `^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`,
    );
    return regex.test(filename);
  });
}

/**
 * Get all JSON files in a directory, excluding non-translatable files
 * and any files matching ignore patterns.
 */
function getJsonFiles(dir: string, ignorePatterns: string[]): string[] {
  return fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.endsWith(".json") &&
        f !== "whitelist.json" &&
        !shouldIgnore(f, ignorePatterns),
    )
    .sort();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileIssue {
  file: string;
  missing: string[];
  extra: string[];
}

interface ModuleResult {
  module: string;
  refKeyCount: number;
  localeFiles: string[];
  issues: FileIssue[];
  error?: string;
}

// ---------------------------------------------------------------------------
// Pattern A: Module locales
// Each module has a locales/ folder with {locale}.json files side by side.
//   <rootDir>/<module>/locales/es-ES.json
//   <rootDir>/<module>/locales/en-US.json
// ---------------------------------------------------------------------------

function checkModuleLocales(
  resolvedDir: string,
  referenceLocale: string,
  ignorePatterns: string[],
): ModuleResult[] {
  const refFileName = `${referenceLocale}.json`;

  // Check if resolvedDir itself is a locales folder
  const isDirectLocalesDir = fs.existsSync(path.join(resolvedDir, refFileName));
  const localesDirs = isDirectLocalesDir
    ? [resolvedDir]
    : findLocalesDirs(resolvedDir);

  if (localesDirs.length === 0) {
    return [];
  }

  const results: ModuleResult[] = [];

  for (const localeDir of localesDirs) {
    const relativePath = path.relative(resolvedDir, path.dirname(localeDir));
    const moduleName =
      !relativePath || relativePath === ".."
        ? path.basename(path.dirname(localeDir))
        : relativePath;

    const refFile = path.join(localeDir, refFileName);

    if (!fs.existsSync(refFile)) {
      results.push({
        module: moduleName,
        refKeyCount: 0,
        localeFiles: [],
        issues: [],
        error: `Reference file ${refFileName} not found`,
      });
      continue;
    }

    const refData = JSON.parse(fs.readFileSync(refFile, "utf8")) as Record<
      string,
      unknown
    >;
    const refKeys = new Set(getKeys(refData));

    const localeFiles = fs
      .readdirSync(localeDir)
      .filter(
        (f) =>
          f.endsWith(".json") &&
          f !== refFileName &&
          f !== "whitelist.json" &&
          !shouldIgnore(f, ignorePatterns),
      )
      .sort();

    const issues: FileIssue[] = [];

    for (const localeFile of localeFiles) {
      const localePath = path.join(localeDir, localeFile);
      const localeData = JSON.parse(
        fs.readFileSync(localePath, "utf8"),
      ) as Record<string, unknown>;
      const localeKeys = new Set(getKeys(localeData));

      const missing = [...refKeys].filter((k) => !localeKeys.has(k));
      const extra = [...localeKeys].filter((k) => !refKeys.has(k));

      if (missing.length > 0 || extra.length > 0) {
        issues.push({ file: localeFile, missing, extra });
      }
    }

    results.push({
      module: moduleName,
      refKeyCount: refKeys.size,
      localeFiles,
      issues,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Pattern B: Language folders
// Root dir contains locale-named folders, each with .json files.
//   <rootDir>/es-ES/common.json
//   <rootDir>/en-US/common.json
// ---------------------------------------------------------------------------

function checkLanguageFolders(
  resolvedDir: string,
  referenceLocale: string,
  ignorePatterns: string[],
): ModuleResult[] {
  const refDir = path.join(resolvedDir, referenceLocale);
  const refFiles = getJsonFiles(refDir, ignorePatterns);

  // Get all other locale folders
  const otherLocales = fs
    .readdirSync(resolvedDir, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        e.name !== referenceLocale &&
        // Locale folders match pattern like "xx-XX" or "xx"
        /^[a-z]{2}(-[A-Z]{2})?$/.test(e.name),
    )
    .map((e) => e.name)
    .sort();

  if (otherLocales.length === 0) {
    console.error(
      `Error: No other locale folders found alongside "${referenceLocale}" in "${resolvedDir}"`,
    );
    process.exit(1);
  }

  const results: ModuleResult[] = [];

  // For each JSON file in the reference locale, check against other locales
  for (const refFileName of refFiles) {
    const refFilePath = path.join(refDir, refFileName);
    const refData = JSON.parse(fs.readFileSync(refFilePath, "utf8")) as Record<
      string,
      unknown
    >;
    const refKeys = new Set(getKeys(refData));
    const issues: FileIssue[] = [];

    for (const locale of otherLocales) {
      const targetFilePath = path.join(resolvedDir, locale, refFileName);

      if (!fs.existsSync(targetFilePath)) {
        issues.push({
          file: `${locale}/${refFileName}`,
          missing: [...refKeys],
          extra: [],
        });
        continue;
      }

      const targetData = JSON.parse(
        fs.readFileSync(targetFilePath, "utf8"),
      ) as Record<string, unknown>;
      const targetKeys = new Set(getKeys(targetData));

      const missing = [...refKeys].filter((k) => !targetKeys.has(k));
      const extra = [...targetKeys].filter((k) => !refKeys.has(k));

      if (missing.length > 0 || extra.length > 0) {
        issues.push({ file: `${locale}/${refFileName}`, missing, extra });
      }
    }

    results.push({
      module: refFileName.replace(/\.json$/, ""),
      refKeyCount: refKeys.size,
      localeFiles: otherLocales.map((l) => `${l}/${refFileName}`),
      issues,
    });
  }

  // Check for extra files in other locales that don't exist in the reference
  for (const locale of otherLocales) {
    const localeDir = path.join(resolvedDir, locale);
    const localeFiles = getJsonFiles(localeDir, ignorePatterns);
    const extraFiles = localeFiles.filter((f) => !refFiles.includes(f));

    if (extraFiles.length > 0) {
      results.push({
        module: `[extra files in ${locale}]`,
        refKeyCount: 0,
        localeFiles: [],
        issues: extraFiles.map((f) => ({
          file: `${locale}/${f}`,
          missing: [],
          extra: [`(entire file has no match in ${referenceLocale})`],
        })),
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Detection: which pattern is this directory using?
// ---------------------------------------------------------------------------

type StructureType = "module-locales" | "language-folders";

function detectStructure(
  resolvedDir: string,
  referenceLocale: string,
): StructureType {
  // If a subfolder with the reference locale name exists → language folders
  const refLocaleDir = path.join(resolvedDir, referenceLocale);
  if (fs.existsSync(refLocaleDir) && fs.statSync(refLocaleDir).isDirectory()) {
    return "language-folders";
  }

  // If the dir contains {referenceLocale}.json directly → module locales (single)
  if (fs.existsSync(path.join(resolvedDir, `${referenceLocale}.json`))) {
    return "module-locales";
  }

  // Otherwise assume module locales pattern (scan for locales/ subdirs)
  return "module-locales";
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function printResults(results: ModuleResult[], referenceLocale: string): void {
  const failedResults = results.filter((r) => r.error || r.issues.length > 0);

  if (failedResults.length === 0) {
    console.info(`✅ All ${results.length} item(s) OK`);
    return;
  }

  for (const r of failedResults) {
    if (r.error) {
      console.info(`\n❌ ${r.module}: ${r.error}`);
      continue;
    }

    console.info(
      `\n❌ ${r.module} (${r.refKeyCount} keys in ${referenceLocale})`,
    );

    for (const issue of r.issues) {
      if (issue.missing.length > 0) {
        console.info(
          `   ${issue.file} — missing ${issue.missing.length} key(s):`,
        );
        for (const k of issue.missing) {
          console.info(`      - ${k}`);
        }
      }
      if (issue.extra.length > 0) {
        console.info(`   ${issue.file} — extra ${issue.extra.length} key(s):`);
        for (const k of issue.extra) {
          console.info(`      + ${k}`);
        }
      }
    }
  }

  const okCount = results.length - failedResults.length;
  console.info(
    `\n${failedResults.length} failed, ${okCount} passed, ${results.length} total`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { localesDir, referenceLocale, ignore } = parseArgs();
  const resolvedDir = path.resolve(process.cwd(), localesDir);

  if (!fs.existsSync(resolvedDir)) {
    console.error(`Error: Directory "${resolvedDir}" does not exist`);
    process.exit(1);
  }

  const structure = detectStructure(resolvedDir, referenceLocale);

  let results: ModuleResult[];

  if (structure === "language-folders") {
    results = checkLanguageFolders(resolvedDir, referenceLocale, ignore);
  } else {
    results = checkModuleLocales(resolvedDir, referenceLocale, ignore);
  }

  if (results.length === 0) {
    console.error(`Error: No locale files found under "${resolvedDir}"`);
    process.exit(1);
  }

  printResults(results, referenceLocale);

  const hasFailures = results.some((r) => r.error || r.issues.length > 0);
  if (hasFailures) {
    process.exit(1);
  }
}

main();
