import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { topGdpCountryNames, topGdpCountryNamesAr } from '@guess-logo/shared/data';
import { logger } from '@/utils/logger';
import { getCountryByName } from './apicountries-service';
import { getLocalizedCountryData } from './country-utils';
import { generateFlagUrl } from './flag-logo-service';

export async function gdpList(language: SupportedLanguage): Promise<LogoItem[]> {
  const logoItems: LogoItem[] = [];
  let idCounter = 0;

  for (const countryName of topGdpCountryNames['top-gdp']) {
    try {
      const countries = await getCountryByName(countryName);
      if (countries.length > 0) {
        const country = countries[0];
        const name = language === 'ar'
          ? (topGdpCountryNamesAr as Record<string, string>)[countryName] ?? ''
          : countryName;

        logoItems.push({
          id: idCounter++,
          name,
          originalName: country.name,
          imageUrl: generateFlagUrl(country),
          eliminated: false,
          countryData: getLocalizedCountryData(country, language),
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
