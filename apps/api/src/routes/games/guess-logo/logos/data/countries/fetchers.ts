import type { CountryLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP, topGdpCountryNames, topGdpCountryNamesAr } from '@guess-logo/guess-logo';
import { logger } from '@/utils/logger';
import { getAllCountries, getCountryByName } from '../../services/countries/apicountries-service';
import { getLocalizedCountryData } from '../../services/countries/country-utils';
import { generateFlagUrl } from '../../services/countries/flag-logo-service';

export async function fetchGdpCountries(language: SupportedLanguage): Promise<CountryLogo[]> {
  const logoItems: CountryLogo[] = [];
  let idCounter = 0;

  for (const countryName of topGdpCountryNames['top-gdp']) {
    try {
      const countries = await getCountryByName(countryName);
      if (countries.length > 0) {
        const country = countries[0];
        const name = language === 'ar'
          ? (topGdpCountryNamesAr as Record<string, string>)[countryName] ?? ''
          : countryName;

        const localizedCountry = getLocalizedCountryData(country, language);
        logoItems.push({
          id: idCounter++,
          name,
          originalName: country.name,
          imageUrl: generateFlagUrl(country),
          type: LOGO_SET_TYPE_MAP.countries,
          countryData: {
            name: localizedCountry.name,
            region: localizedCountry.region,
            currency: localizedCountry.currencies?.[0]?.code ?? '',
          },
        });
      }
      else {
        logger.warn(`API returned no data for country: ${countryName}`);
      }
    }
    catch (error) {
      logger.error(error, `Failed to fetch data for country ${countryName}:`);
    }
  }

  return logoItems;
}

export async function fetchPopulationCountries(language: SupportedLanguage): Promise<CountryLogo[]> {
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
