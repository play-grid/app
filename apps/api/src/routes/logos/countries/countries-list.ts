import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { countryCode } from '@guess-logo/shared/data';
import { generateFlagUrl } from './flag-logo-service';

export async function countriesList(_language: SupportedLanguage): Promise<LogoItem[]> {
  const arr = countryCode as Record<string, string>;

  return Object.entries(arr).map(([countryName], index) => ({
    id: index,
    name: countryName,
    imageUrl: generateFlagUrl(countryName),
    eliminated: false,
  }));
}
