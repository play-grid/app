import type { Country } from '../sources/api-countries';
import type { StatItemTransformer } from '../types';
import { APICountriesClient } from '../sources/api-countries';

export interface CountriesTransformerConfig {
  listId?: 'top-gdp' | 'top-population';
  fetchCountries: () => Promise<Country[]>;
  translationService: {
    translateText: (text: string, targetLang: 'ar' | 'en') => Promise<string>;
  };
}

export function createCountriesTransformer(config: CountriesTransformerConfig): StatItemTransformer<Country> {
  const client = new APICountriesClient();

  return {
    source: 'restcountries',
    category: 'countries',

    async fetch() {
      if (config.listId === 'top-population') {
        const allCountries = await client.getAllCountries();
        return allCountries.sort((a, b) => (b.population || 0) - (a.population || 0));
      }
      return await config.fetchCountries();
    },

    async transform(country) {
      const base = {
        entity: 'country',
        externalId: country.cca2,
        category: 'countries',
        name: country.name.common,
        imageUrl: country.flags?.png,
        source: 'restcountries',
      };

      let nameAr = country.translations?.ara?.common;
      let regionAr: string | null = null;
      let capitalAr: string | null = null;
      let currencyAr: string | null = null;

      if (!nameAr) {
        nameAr = await config.translationService.translateText(country.name.common, 'ar');
      }

      if (country.region) {
        regionAr = await config.translationService.translateText(country.region, 'ar');
      }

      if (country.capital && country.capital[0]) {
        capitalAr = await config.translationService.translateText(country.capital[0], 'ar');
      }

      if (country.currencies) {
        const currencyCodes = Object.keys(country.currencies);
        if (currencyCodes.length > 0) {
          currencyAr = await config.translationService.translateText(currencyCodes[0], 'ar');
        }
      }

      const items: any[] = [];

      if (country.population) {
        items.push({
          ...base,
          nameAr,
          metricType: 'population',
          value: country.population,
          unit: 'people',
          unitAr: 'ناس',
          hint: regionAr || country.region,
          hintAr: regionAr,
        });
      }

      if (country.area) {
        items.push({
          ...base,
          nameAr,
          metricType: 'area',
          value: country.area,
          unit: 'km²',
          unitAr: 'كيلومتر مربع',
          hint: regionAr || country.region,
          hintAr: regionAr,
        });
      }

      if (country.capital && country.capital[0]) {
        items.push({
          ...base,
          nameAr,
          metricType: 'capital',
          value: 1,
          unit: country.capital[0],
          unitAr: capitalAr || country.capital[0],
          hint: regionAr || country.region,
          hintAr: regionAr,
        });
      }

      if (country.currencies) {
        const currencyCodes = Object.keys(country.currencies);
        if (currencyCodes.length > 0) {
          items.push({
            ...base,
            nameAr,
            metricType: 'currency',
            value: 1,
            unit: currencyCodes[0],
            unitAr: currencyAr || currencyCodes[0],
            hint: regionAr || country.region,
            hintAr: regionAr,
          });
        }
      }

      return items;
    },
  };
}
