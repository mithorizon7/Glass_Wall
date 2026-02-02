/**
 * Shared i18n utilities
 *
 * Common functions used across i18n scripts to avoid duplication.
 */

import fs from "fs";
import path from "path";

/**
 * Flatten nested object keys into dot-notation array
 * @param {object} obj - Object to flatten
 * @param {string} prefix - Current key prefix
 * @returns {string[]} Array of flattened keys
 */
export function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Get value from nested object by dot-notation key
 * @param {object} obj - Object to traverse
 * @param {string} keyPath - Dot-notation key path
 * @returns {*} Value at path or undefined
 */
export function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((o, k) => o?.[k], obj);
}

/**
 * Load and parse JSON file safely
 * @param {string} filePath - Path to JSON file
 * @returns {{ data: object|null, error: string|null }}
 */
export function loadJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { data: null, error: `File not found: ${filePath}` };
    }
    const content = fs.readFileSync(filePath, "utf8");
    return { data: JSON.parse(content), error: null };
  } catch (e) {
    return { data: null, error: `JSON parse error in ${filePath}: ${e.message}` };
  }
}

/**
 * Get the configuration for i18n scripts
 * @param {string} baseDir - Base directory (usually __dirname of calling script)
 * @returns {object} Configuration object
 */
export function getConfig(baseDir) {
  return {
    localesDir: path.join(baseDir, "../client/src/locales"),
    srcDir: path.join(baseDir, "../client/src"),
    languages: ["en", "lv", "ru"],
    productionLanguages: ["en", "lv", "ru"],
    namespaces: ["common", "glass-wall"],
    namespaceMap: {
      glassWall: "glass-wall",
      common: "common",
    },
  };
}

/**
 * Map internal namespace name to file name
 * @param {string} ns - Internal namespace name
 * @returns {string} File name for namespace
 */
export function namespaceToFile(ns) {
  const map = {
    glassWall: "glass-wall",
    common: "common",
  };
  return map[ns] || ns;
}

/**
 * Walk directory recursively and call callback for each matching file
 * @param {string} dir - Directory to walk
 * @param {function} callback - Callback function(filePath)
 * @param {string[]} extensions - File extensions to match
 * @param {string[]} ignoreDirs - Directories to ignore
 */
export function walkDirectory(
  dir,
  callback,
  extensions = [".tsx", ".ts"],
  ignoreDirs = [".", "node_modules", "locales"],
) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith(".") && !ignoreDirs.includes(file)) {
        walkDirectory(filePath, callback, extensions, ignoreDirs);
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      callback(filePath);
    }
  }
}
