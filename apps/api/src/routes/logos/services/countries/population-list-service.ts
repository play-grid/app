import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { getAllCountries } from './apicountries-service';
import { getLocalizedCountryName } from './country-utils';
import { generateFlagUrl } from './flag-logo-service';

export async function populationList(language: SupportedLanguage): Promise<LogoItem[]> {
  const countries = await getAllCountries();

  // Sort by population in descending order
  const sortedCountries = countries
    .sort((a, b) => (b.population || 0) - (a.population || 0));

  return sortedCountries.map((country, index) => ({
    id: index,
    name: getLocalizedCountryName(country, language),
    originalName: country.name,
    imageUrl: generateFlagUrl(country),
    eliminated: false,
    countryData: country,
  }));
}
