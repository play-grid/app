import type { CountryLogo } from '@playgrid/guess-logo';
import type { SupportedLanguage } from '@playgrid/shared/types';
import type { Context } from 'hono';
import type { AppEnv } from '@/lib/types';
import { LOGO_SET_TYPE_MAP } from '@playgrid/guess-logo';
import { fetchStatItems } from '@/services/stat-items.service';

export async function fetchGdpCountries(language: SupportedLanguage, c: Context<AppEnv>): Promise<CountryLogo[]> {
  return fetchCountriesFromDB('population', language, c);
}

export async function fetchPopulationCountries(language: SupportedLanguage, c: Context<AppEnv>): Promise<CountryLogo[]> {
  return fetchCountriesFromDB('population', language, c);
}

async function fetchCountriesFromDB(
  metricType: string,
  language: SupportedLanguage,
  c: Context<AppEnv>,
): Promise<CountryLogo[]> {
  const items = await fetchStatItems(c, {
    category: 'countries',
    metricType,
    lang: language,
    status: 'approved',
    limit: 1000,
  });

  return items.map((item, index) => ({
    id: index,
    name: language === 'ar' ? item.nameAr || item.name : item.name,
    originalName: item.name,
    imageUrl: item.imageUrl || '',
    type: LOGO_SET_TYPE_MAP.countries,
    countryData: {
      name: language === 'ar' ? item.nameAr || item.name : item.name,
      region: language === 'ar' ? item.hintAr || item.hint || '' : (item.hint || ''),
      currency: language === 'ar' ? item.unitAr || item.unit || '' : (item.unit || ''),
    },
  })).filter(logo => logo.imageUrl);
}
