import type { CountryLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';

interface StatItemResponse {
  id: string;
  name: string;
  nameAr: string | null;
  imageUrl: string | null;
  hint: string | null;
  hintAr: string | null;
  metricType: string;
  value: number;
  unit: string;
  unitAr: string | null;
}

interface StatItemsAPIResponse {
  items: StatItemResponse[];
}

export async function fetchGdpCountries(language: SupportedLanguage): Promise<CountryLogo[]> {
  return fetchCountriesFromDB('population', language);
}

export async function fetchPopulationCountries(language: SupportedLanguage): Promise<CountryLogo[]> {
  return fetchCountriesFromDB('population', language);
}

async function fetchCountriesFromDB(
  metricType: string,
  language: SupportedLanguage,
): Promise<CountryLogo[]> {
  const baseUrl = '/data/stat-items';
  const url = `${baseUrl}?category=countries&metricType=${metricType}&lang=${language}&status=approved&limit=1000`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.statusText}`);
  }

  const data = await response.json() as StatItemsAPIResponse;

  return data.items.map((item, index) => ({
    id: index,
    name: language === 'ar' ? item.nameAr || item.name : item.name,
    originalName: item.name,
    imageUrl: item.imageUrl || '',
    type: LOGO_SET_TYPE_MAP.countries,
    countryData: {
      name: language === 'ar' ? item.nameAr || item.name : item.name,
      region: language === 'ar' ? item.hintAr || item.hint || '' : (item.hint || ''),
      currency: language === 'ar' ? item.unitAr || item.unit : (item.unit || ''),
    },
  })).filter(logo => logo.imageUrl);
}
