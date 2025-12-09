import type { LogoSetKey } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { fetchCompaniesGeneral, fetchSaudiCompanies } from './companies/fetchers';
import { fetchGdpCountries, fetchPopulationCountries } from './countries/fetchers';
import { fetchDramaMovies, fetchFamilyMovies, fetchTopRatedMovies } from './movies/fetchers';

export type Fetcher<T = any> = (language: SupportedLanguage) => Promise<T[]>;

type FetcherRegistry = Partial<Record<LogoSetKey, Record<string, Fetcher>>>;

const REGISTRY: FetcherRegistry = {
  companies: {
    companies: fetchCompaniesGeneral,
    saudi: fetchSaudiCompanies,
  },
  countries: {
    'countries': fetchGdpCountries,
    'top-population': fetchPopulationCountries,
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
