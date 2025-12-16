/**
 * Internationalized formatting utilities
 * 
 * Uses Intl.* APIs for locale-aware formatting of dates, numbers, and currencies.
 * These formatters automatically adapt to the current i18n locale.
 */

import i18n from './i18n';

/**
 * Get the current locale from i18n
 */
function getCurrentLocale(): string {
  return i18n.language || 'lv';
}

/**
 * Format a date according to the current locale
 */
export function formatDate(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getCurrentLocale(), options).format(d);
}

/**
 * Format a date with time according to the current locale
 */
export function formatDateTime(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getCurrentLocale(), options).format(d);
}

/**
 * Format a time according to the current locale
 */
export function formatTime(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getCurrentLocale(), options).format(d);
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' }
): string {
  return new Intl.RelativeTimeFormat(getCurrentLocale(), options).format(value, unit);
}

/**
 * Format a number according to the current locale
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(getCurrentLocale(), options).format(value);
}

/**
 * Format a percentage according to the current locale
 */
export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 0, maximumFractionDigits: 1 }
): string {
  return new Intl.NumberFormat(getCurrentLocale(), {
    style: 'percent',
    ...options
  }).format(value);
}

/**
 * Format currency according to the current locale
 */
export function formatCurrency(
  value: number,
  currency: string = 'EUR',
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(getCurrentLocale(), {
    style: 'currency',
    currency,
    ...options
  }).format(value);
}

/**
 * Format a list according to the current locale
 * e.g., "apples, oranges, and bananas" or "apples, oranges, vai bananas" in Latvian
 */
export function formatList(
  items: string[],
  options: Intl.ListFormatOptions = { style: 'long', type: 'conjunction' }
): string {
  return new Intl.ListFormat(getCurrentLocale(), options).format(items);
}

/**
 * Get plural category for a number according to locale rules
 * Useful for custom plural logic outside ICU messages
 */
export function getPluralCategory(
  count: number,
  options: Intl.PluralRulesOptions = { type: 'cardinal' }
): Intl.LDMLPluralRule {
  return new Intl.PluralRules(getCurrentLocale(), options).select(count);
}
