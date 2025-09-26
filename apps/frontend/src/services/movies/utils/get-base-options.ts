import type { LanguageOption, PageOption } from 'tmdb-ts';
import type { SupportedLanguage, SupportedRegion } from '@/utils/language-utils';

// This object acts as a type-safe mapping from language codes to region codes.
// You can add more mappings here as you add supported languages.
const languageToRegionMap = {
  ar: 'ar-SA',
  en: 'en-US',
} as const;

/**
 * Defines the base options for a TMDB API call.
 */
export type TMDBBaseOptions = PageOption & LanguageOption & {
  // language is a simpler ISO 639-1 code (e.g., 'en', 'ar')
  // region must be a specific ISO 3166-1 code (e.g., 'en-US', 'ar-SA')
  region: SupportedRegion;
};

/**
 * Creates a pre-configured options object for TMDB API calls.
 *
 * @returns A fully type-safe options object including page, language, and region.
 */
export function getBaseOptions(lang?: SupportedLanguage): TMDBBaseOptions {
  const safeLang = lang ?? 'en';
  const mappedRegion = languageToRegionMap[safeLang];

  return {
    page: 1,
    language: mappedRegion,
    region: mappedRegion,
  };
}
