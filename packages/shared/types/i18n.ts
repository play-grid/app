import type { z } from 'zod';
import type { languageQuery } from '../schemas';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const SUPPORTED_REGION = ['en-US', 'ar-SA'] as const;
export type SupportedRegion = typeof SUPPORTED_REGION[number];

export type LanguageQuery = z.infer<typeof languageQuery>;

export type LocaleRecord = {
  [key in SupportedLanguage]: string;
};
