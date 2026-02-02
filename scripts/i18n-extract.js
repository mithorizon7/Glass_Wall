#!/usr/bin/env node
/**
 * i18n Key Extraction Script
 *
 * Extracts translation keys from source code and compares against locale files.
 * Reports keys used in code but missing from locale files.
 *
 * Supports:
 * - t("key") and t('key') function calls
 * - Aliased translation functions (e.g., tc for common namespace)
 * - Explicit namespace prefixes (e.g., "common:key")
 * - <Trans i18nKey="key"> components
 * - Namespace detection from useTranslation() hooks
 *
 * Usage: node scripts/i18n-extract.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  flattenKeys,
  loadJsonFile,
  walkDirectory,
  getConfig,
  namespaceToFile,
} from "./i18n-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getConfig(__dirname);

const extractedKeys = {
  common: new Set(),
  glassWall: new Set(),
};

const KNOWN_NAMESPACES = ["common", "glassWall"];

function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  let defaultNs = "common";

  const useTransMatch = content.match(/useTranslation\(\s*["'](\w+)["']\s*\)/);
  if (useTransMatch) {
    defaultNs = useTransMatch[1];
  }

  const aliasedTranslations = { t: defaultNs };
  const aliasMatches = content.matchAll(
    /const\s*\{\s*t:\s*(\w+)\s*\}\s*=\s*useTranslation\(\s*["'](\w+)["']\s*\)/g,
  );
  for (const match of aliasMatches) {
    aliasedTranslations[match[1]] = match[2];
  }

  const simpleTransMatch = content.matchAll(
    /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\s*["'](\w+)["']\s*\)/g,
  );
  for (const match of simpleTransMatch) {
    aliasedTranslations["t"] = match[1];
  }

  const patterns = [/\b(t|tc|tg)\(\s*["']([^"']+)["']/g];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const fn = match[1];
      const key = match[2];

      let ns = aliasedTranslations[fn] || defaultNs;

      if (key.includes(":")) {
        const colonIndex = key.indexOf(":");
        const explicitNs = key.substring(0, colonIndex);
        const actualKey = key.substring(colonIndex + 1);

        if (KNOWN_NAMESPACES.includes(explicitNs)) {
          addKey(explicitNs, actualKey);
        }
      } else {
        addKey(ns, key);
      }
    }
  }

  const transMatches = content.matchAll(/<Trans\s+[^>]*i18nKey=["']([^"']+)["']/g);
  for (const match of transMatches) {
    const key = match[1];
    if (key.includes(":")) {
      const [ns, actualKey] = key.split(":");
      if (KNOWN_NAMESPACES.includes(ns)) {
        addKey(ns, actualKey);
      }
    } else {
      addKey(defaultNs, key);
    }
  }
}

function addKey(ns, key) {
  if (ns === "glassWall" || ns === "glass-wall") {
    extractedKeys.glassWall.add(key);
  } else if (ns === "common") {
    extractedKeys.common.add(key);
  }
}

function loadLocaleKeys(lang, ns) {
  const nsFile = namespaceToFile(ns);
  const filePath = path.join(config.localesDir, lang, `${nsFile}.json`);

  const { data, error } = loadJsonFile(filePath);

  if (error || !data) {
    return { flat: new Set(), prefixes: new Set() };
  }

  const flatKeys = flattenKeys(data);

  const prefixes = new Set();
  for (const key of flatKeys) {
    const parts = key.split(".");
    let prefix = "";
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}.${parts[i]}` : parts[i];
      prefixes.add(prefix);
    }
  }

  return { flat: new Set(flatKeys), prefixes };
}

function keyExists(key, localeData) {
  return localeData.flat.has(key) || localeData.prefixes.has(key);
}

function main() {
  console.log("Extracting i18n keys from source code...\n");

  walkDirectory(config.srcDir, extractKeysFromFile);

  console.log(`Found ${extractedKeys.common.size} common keys`);
  console.log(`Found ${extractedKeys.glassWall.size} glassWall keys\n`);

  const enCommonData = loadLocaleKeys("en", "common");
  const enGlassWallData = loadLocaleKeys("en", "glassWall");

  const missingFromCommon = [];
  const missingFromGlassWall = [];

  for (const key of extractedKeys.common) {
    if (!keyExists(key, enCommonData)) {
      missingFromCommon.push(key);
    }
  }

  for (const key of extractedKeys.glassWall) {
    if (!keyExists(key, enGlassWallData)) {
      missingFromGlassWall.push(key);
    }
  }

  if (missingFromCommon.length > 0) {
    console.log("MISSING from common.json:");
    missingFromCommon.sort().forEach((k) => console.log(`  - ${k}`));
    console.log();
  }

  if (missingFromGlassWall.length > 0) {
    console.log("MISSING from glass-wall.json:");
    missingFromGlassWall.sort().forEach((k) => console.log(`  - ${k}`));
    console.log();
  }

  const totalMissing = missingFromCommon.length + missingFromGlassWall.length;

  if (totalMissing === 0) {
    console.log("All extracted keys are present in locale files!");
  } else {
    console.log(
      `\nSummary: ${totalMissing} keys used in code but missing from English locale files`,
    );
  }

  process.exit(totalMissing > 0 ? 1 : 0);
}

main();
