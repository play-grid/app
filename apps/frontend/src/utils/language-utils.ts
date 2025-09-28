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
