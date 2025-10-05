import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { topGdpCountryNames } from '@guess-logo/shared/data';
import { getCountryByName } from './apicountries-service';
import { getLocalizedCountryName } from './country-utils';
import { generateFlagUrl } from './flag-logo-service';

export async function gdpList(language: SupportedLanguage): Promise<LogoItem[]> {
  const logoItems: LogoItem[] = [];
  let idCounter = 0;

  for (const countryName of topGdpCountryNames['top-gdp']) {
    try {
      const countries = await getCountryByName(countryName);
      if (countries.length > 0) {
        const country = countries[0];
        logoItems.push({
          id: idCounter++,
          name: getLocalizedCountryName(country, language),
          originalName: country.name,
          imageUrl: generateFlagUrl(country),
          eliminated: false,
          countryData: country,
        });
      }
      else {
        console.warn(`API returned no data for country: ${countryName}`);
      }
    }
    catch (error) {
      console.error(`Failed to fetch data for country ${countryName}:`, error);
    }
  }

  return logoItems;
}
