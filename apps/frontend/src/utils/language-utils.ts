import type { SupportedLanguage } from '@guess-logo/shared/types';
import { SUPPORTED_LANGUAGES } from '@guess-logo/shared/types';

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export function getLanguageFromPath(pathname: string): SupportedLanguage | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  return isValidLanguage(firstSegment) ? firstSegment : null;
}

export function removeLanguageFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (isValidLanguage(firstSegment)) {
    return `/${segments.slice(1).join('/')}`;
  }
  return pathname;
}

export function addLanguageToPath(pathname: string, language: SupportedLanguage): string {
  const cleanPath = removeLanguageFromPath(pathname);
  return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
}
/**
 * Safely extracts a localized string from an object based on the current i18n language.
 * Falls back to 'en' or the first available key.
 */
export function getLocalizedName<T extends Record<string, any>>(
  nameObj: T,
  language: SupportedLanguage,
): string {
  if (!nameObj)
    return '';
  // If nameObj is just a string (fallback for custom lists)
  if (typeof nameObj === 'string')
    return nameObj;

  return nameObj[language as keyof T] || nameObj.en || Object.values(nameObj)[0] || '';
}
