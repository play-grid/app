import type { CountryLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';
import { topGdpCountryNames, topGdpCountryNamesAr } from '@guess-logo/shared/data';
import { logger } from '@/utils/logger';
import { getCountryByName } from './apicountries-service';
import { getLocalizedCountryData } from './country-utils';
import { generateFlagUrl } from './flag-logo-service';

export async function gdpList(language: SupportedLanguage): Promise<CountryLogo[]> {
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
