import type { LogoItem } from '@/types';
import type { SupportedLanguage } from '@/utils/language-utils';
import countryCodeMap from '@/data/country-code.json';
import { generateFlagUrl } from './flag-logo-service';

export async function countriesList(_language: SupportedLanguage): Promise<LogoItem[]> {
  const arr = countryCodeMap as Record<string, string>;

  return Object.entries(arr).map(([countryName], index) => ({
    id: index,
    name: countryName,
    imageUrl: generateFlagUrl(countryName),
    eliminated: false,
  }));
}
