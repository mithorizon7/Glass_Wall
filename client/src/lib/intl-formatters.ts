/**
 * Internationalized formatting utilities
 *
 * Uses Intl.* APIs for locale-aware formatting of dates, numbers, and currencies.
 * These formatters automatically adapt to the current i18n locale.
 *
 * Formatters are cached per locale for performance.
 */

import i18n from "./i18n";

type DateTimeFormatterKey = string;
type NumberFormatterKey = string;

const dateTimeFormatters = new Map<DateTimeFormatterKey, Intl.DateTimeFormat>();
const numberFormatters = new Map<NumberFormatterKey, Intl.NumberFormat>();
const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>();
const listFormatters = new Map<string, Intl.ListFormat>();
const pluralRules = new Map<string, Intl.PluralRules>();

function getCurrentLocale(): string {
  return i18n.language || "lv";
}

function makeCacheKey(locale: string, options: object): string {
  return `${locale}:${JSON.stringify(options)}`;
}

function getDateTimeFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = getCurrentLocale();
  const key = makeCacheKey(locale, options);

  let formatter = dateTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }
  return formatter;
}

function getNumberFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const locale = getCurrentLocale();
  const key = makeCacheKey(locale, options);

  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

function getRelativeTimeFormatter(
  options: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat {
  const locale = getCurrentLocale();
  const key = makeCacheKey(locale, options);

  let formatter = relativeTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, options);
    relativeTimeFormatters.set(key, formatter);
  }
  return formatter;
}

function getListFormatter(options: Intl.ListFormatOptions): Intl.ListFormat {
  const locale = getCurrentLocale();
  const key = makeCacheKey(locale, options);

  let formatter = listFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.ListFormat(locale, options);
    listFormatters.set(key, formatter);
  }
  return formatter;
}

function getPluralRulesFormatter(options: Intl.PluralRulesOptions): Intl.PluralRules {
  const locale = getCurrentLocale();
  const key = makeCacheKey(locale, options);

  let rules = pluralRules.get(key);
  if (!rules) {
    rules = new Intl.PluralRules(locale, options);
    pluralRules.set(key, rules);
  }
  return rules;
}

function toDate(date: Date | number | string): Date {
  if (date instanceof Date) return date;
  if (typeof date === "number") return new Date(date);
  return new Date(date);
}

/**
 * Format a date according to the current locale
 */
export function formatDate(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  return getDateTimeFormatter(options).format(toDate(date));
}

/**
 * Format a date with time according to the current locale
 */
export function formatDateTime(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  return getDateTimeFormatter(options).format(toDate(date));
}

/**
 * Format a time according to the current locale
 */
export function formatTime(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { timeStyle: "short" },
): string {
  return getDateTimeFormatter(options).format(toDate(date));
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options: Intl.RelativeTimeFormatOptions = { numeric: "auto" },
): string {
  return getRelativeTimeFormatter(options).format(value, unit);
}

/**
 * Format a number according to the current locale
 */
export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  return getNumberFormatter(options).format(value);
}

/**
 * Format a percentage according to the current locale
 */
export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 0, maximumFractionDigits: 1 },
): string {
  return getNumberFormatter({ style: "percent", ...options }).format(value);
}

/**
 * Format currency according to the current locale
 */
export function formatCurrency(
  value: number,
  currency: string = "EUR",
  options: Intl.NumberFormatOptions = {},
): string {
  return getNumberFormatter({ style: "currency", currency, ...options }).format(value);
}

/**
 * Format a list according to the current locale
 * e.g., "apples, oranges, and bananas" or "apples, oranges, vai bananas" in Latvian
 */
export function formatList(
  items: string[],
  options: Intl.ListFormatOptions = { style: "long", type: "conjunction" },
): string {
  return getListFormatter(options).format(items);
}

/**
 * Get plural category for a number according to locale rules
 * Useful for custom plural logic outside ICU messages
 */
export function getPluralCategory(
  count: number,
  options: Intl.PluralRulesOptions = { type: "cardinal" },
): Intl.LDMLPluralRule {
  return getPluralRulesFormatter(options).select(count);
}

/**
 * Clear all formatter caches (useful after locale change)
 */
export function clearFormatterCaches(): void {
  dateTimeFormatters.clear();
  numberFormatters.clear();
  relativeTimeFormatters.clear();
  listFormatters.clear();
  pluralRules.clear();
}
