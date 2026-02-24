import type { Country } from '../sources/api-countries';
import type { StatItemTransformer } from '../types';
import { APICountriesClient } from '../sources/api-countries';

const TOP_GDP_COUNTRIES = [
  'United States',
  'China',
  'Germany',
  'Japan',
  'India',
  'United Kingdom',
  'France',
  'Italy',
  'Brazil',
  'Ghana',
  'Libya',
  'Tunisia',
  'Jordan',
  'Lebanon',
  'Syria',
  'Mauritania',
  'Djibouti',
  'Comoros',
  'Somalia',
  'Yemen',
  'Canada',
  'Russia',
  'Mexico',
  'Australia',
  'Palestine',
  'Bahrain',
  'Spain',
  'Indonesia',
  'Netherlands',
  'Turkey',
  'Saudi Arabia',
  'Switzerland',
  'Poland',
  'Argentina',
  'Belgium',
  'Sweden',
  'Ireland',
  'Thailand',
  'United Arab Emirates',
  'Austria',
  'Singapore',
  'Norway',
  'Bangladesh',
  'Philippines',
  'Vietnam',
  'Denmark',
  'Iran',
  'Malaysia',
  'Egypt',
  'Hong Kong',
  'South Africa',
  'Nigeria',
  'Colombia',
  'Romania',
  'Pakistan',
  'Chile',
  'Finland',
  'Portugal',
  'Peru',
  'Kazakhstan',
  'New Zealand',
  'Iraq',
  'Algeria',
  'Greece',
  'Qatar',
  'Hungary',
  'Ukraine',
  'Kuwait',
  'Ethiopia',
  'Morocco',
  'Slovakia',
  'Dominican Republic',
  'Ecuador',
  'Sudan',
  'Oman',
  'Kenya',
  'Guatemala',
  'Bulgaria',
  'Uzbekistan',
  'Costa Rica',
  'Luxembourg',
  'Angola',
  'Croatia',
  'Sri Lanka',
  'Panama',
  'Serbia',
  'Lithuania',
  'Tanzania',
  'Uruguay',
];

export function createCountriesTransformer(config?: { baseUrl?: string }): StatItemTransformer<Country> {
  const client = new APICountriesClient(config);

  return {
    source: 'restcountries',
    category: 'countries',

    async fetch() {
      const allCountries = await client.getAllCountries();
      return allCountries.filter((country: Country) =>
        TOP_GDP_COUNTRIES.some(name =>
          country.name.common === name
          || country.altSpellings?.includes(name),
        ),
      );
    },

    transform(country) {
      const base = {
        entity: 'country',
        externalId: country.cca2,
        category: 'countries',
        name: country.name.common,
        nameAr: country.translations?.ara?.common,
        imageUrl: country.flags?.png,
        source: 'restcountries',
      };

      const items: any[] = [];

      if (country.population) {
        items.push({
          ...base,
          metricType: 'population',
          value: country.population,
          unit: 'people',
        });
      }

      if (country.area) {
        items.push({
          ...base,
          metricType: 'area',
          value: country.area,
          unit: 'km²',
        });
      }

      if (country.capital && country.capital[0]) {
        items.push({
          ...base,
          metricType: 'capital',
          value: 1,
          unit: country.capital[0],
          hint: `Capital city`,
        });
      }

      return items;
    },
  };
}

export const countriesTransformer = createCountriesTransformer();
