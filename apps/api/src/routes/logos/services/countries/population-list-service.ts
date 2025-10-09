import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { getAllCountries } from './apicountries-service';
import { getLocalizedCountryData } from './country-utils';
import { generateFlagUrl } from './flag-logo-service';

export async function populationList(language: SupportedLanguage): Promise<LogoItem[]> {
  const countries = await getAllCountries();

  // Sort by population in descending order
  const sortedCountries = countries
    .sort((a, b) => (b.population || 0) - (a.population || 0));

  return sortedCountries.map((country, index) => {
    const name = language === 'ar' ? country.translations?.ar ?? '' : country.name;
    return {
      id: index,
      name,
      originalName: country.name,
      imageUrl: generateFlagUrl(country),
      eliminated: false,
      countryData: getLocalizedCountryData(country, language),
    };
  });
}
