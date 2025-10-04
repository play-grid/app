import type { Country } from '@guess-logo/shared/types';

const BASE_URL = 'https://www.apicountries.com';

async function fetchFromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function getAllCountries(): Promise<Country[]> {
  return fetchFromApi<Country[]>('/countries');
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/region/${region}`);
}

export async function getCountriesBySubregion(subregion: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/subregion/${subregion}`);
}

export async function getCountryByName(name: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/name/${name}`);
}

export async function getCountriesByLanguage(language: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/lang/${language}`);
}

export async function getCountryByCapital(capital: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/capital/${capital}`);
}

export async function getCountryByCallingCode(code: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/callingcode/${code}`);
}

export async function getCountriesByBorder(name: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/borders/${name}`);
}

export async function getCountryByAlphaCode(code: string): Promise<Country[]> {
  return fetchFromApi<Country[]>(`/alpha/${code}`);
}
