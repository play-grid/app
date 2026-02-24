import type { Country as APICountry } from '@guess-logo/data-pipeline';
import type { Country } from '@guess-logo/shared/types';
import { APICountriesClient } from '@guess-logo/data-pipeline';

const client = new APICountriesClient();

function transformApiCountryToShared(apiCountry: APICountry): Country {
  const currencies = Object.entries(apiCountry.currencies || {}).map(([code, currency]) => ({
    code,
    name: currency.name,
    symbol: currency.symbol,
  }));

  const languages = Object.entries(apiCountry.languages || {}).map(([iso639_1, name]) => ({
    iso639_1,
    iso639_2: '',
    name,
    nativeName: '',
  }));

  const translations = apiCountry.translations || {};

  const topLevelDomain = apiCountry.tld || [];

  return {
    name: apiCountry.name.common,
    topLevelDomain,
    alpha2Code: apiCountry.cca2,
    alpha3Code: apiCountry.cca3,
    callingCodes: [],
    capital: apiCountry.capital?.[0] || '',
    altSpellings: apiCountry.altSpellings || [],
    subregion: apiCountry.subregion || '',
    region: apiCountry.region || '',
    population: apiCountry.population || 0,
    latlng: apiCountry.latlng || [0, 0],
    demonym: apiCountry.demonyms?.eng?.m || '',
    area: apiCountry.area || 0,
    timezones: [],
    borders: apiCountry.borders || [],
    nativeName: Object.values(apiCountry.name.nativeName || {})[0]?.official || apiCountry.name.official,
    numericCode: apiCountry.ccn3 || '',
    flags: apiCountry.flags || { svg: '', png: '' },
    currencies,
    languages,
    translations: Object.fromEntries(
      Object.entries(translations).map(([lang, trans]) => [lang, trans.common]),
    ),
    flag: apiCountry.flags?.png || '',
    regionalBlocs: [],
    cioc: apiCountry.cioc || '',
    independent: apiCountry.independent || false,
  };
}

export async function getAllCountries(): Promise<Country[]> {
  const apiCountries = await client.getAllCountries();
  return apiCountries.map(transformApiCountryToShared);
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
  const apiCountries = await client.getCountriesByRegion(region);
  return apiCountries.map(transformApiCountryToShared);
}

export async function getCountriesBySubregion(subregion: string): Promise<Country[]> {
  const apiCountries = await client.getCountriesBySubregion(subregion);
  return apiCountries.map(transformApiCountryToShared);
}

export async function getCountryByName(name: string): Promise<Country[]> {
  const apiCountries = await client.getCountryByName(name);
  return apiCountries.map(transformApiCountryToShared);
}

export async function getCountriesByLanguage(language: string): Promise<Country[]> {
  const apiCountries = await client.getCountriesByLanguage(language);
  return apiCountries.map(transformApiCountryToShared);
}

export async function getCountryByCapital(capital: string): Promise<Country[]> {
  const apiCountries = await client.getCountryByCapital(capital);
  return apiCountries.map(transformApiCountryToShared);
}

export async function getCountryByAlphaCode(code: string): Promise<Country[]> {
  const apiCountries = await client.getCountryByAlphaCode(code);
  return apiCountries.map(transformApiCountryToShared);
}
