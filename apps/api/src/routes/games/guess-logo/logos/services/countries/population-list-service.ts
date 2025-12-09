import type { CountryLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';
import { getAllCountries } from './apicountries-service';
import { getLocalizedCountryData } from './country-utils';
import { generateFlagUrl } from './flag-logo-service';

export async function populationList(language: SupportedLanguage): Promise<CountryLogo[]> {
  const countries = await getAllCountries();

  // Sort by population in descending order
  const sortedCountries = countries
    .sort((a, b) => (b.population || 0) - (a.population || 0));

  return sortedCountries.map((country, index) => {
    const name = language === 'ar' ? country.translations?.ar ?? '' : country.name;
    const localizedCountry = getLocalizedCountryData(country, language);
    return {
      id: index,
      name,
      originalName: country.name,
      imageUrl: generateFlagUrl(country),
      type: LOGO_SET_TYPE_MAP.countries,
      countryData: {
        name: localizedCountry.name,
        region: localizedCountry.region,
        currency: localizedCountry.currencies?.[0]?.code ?? '',
      },
    };
  });
}
