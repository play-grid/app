import type { LogoSetKey } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { Context } from 'hono';
import type { AppEnv } from '@/lib/types';
import { fetchCompaniesFromDB } from './companies/fetchers-from-db';
import { fetchGdpCountries, fetchPopulationCountries } from './countries/fetchers';
import { fetchDramaMovies, fetchFamilyMovies, fetchTopRatedMovies } from './movies/fetchers';

export type Fetcher<T = any> = (language: SupportedLanguage, c: Context<AppEnv>) => Promise<T[]>;

type FetcherRegistry = Partial<Record<LogoSetKey, Record<string, Fetcher>>>;

const REGISTRY: FetcherRegistry = {
  companies: {
    companies: (lang, c) => fetchCompaniesFromDB('companies', lang, c),
    saudi: (lang, c) => fetchCompaniesFromDB('saudi-companies', lang, c),
  },
  countries: {
    'countries': (lang, c) => fetchGdpCountries(lang, c),
    'top-population': (lang, c) => fetchPopulationCountries(lang, c),
  },
  movies: {
    'top-imdb': fetchTopRatedMovies,
    'family': fetchFamilyMovies,
    'drama': fetchDramaMovies,
  },
};

export function getLogoFetcher(
  set: LogoSetKey,
  listId: string,
): Fetcher | null {
  if (!REGISTRY[set]) {
    return null;
  }

  return REGISTRY[set]?.[listId] ?? null;
}
