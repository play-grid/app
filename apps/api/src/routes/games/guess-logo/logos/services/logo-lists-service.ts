import type { LogoList, LogoSetKey } from '@guess-logo/shared/types/logos';
import { companiesLists } from './companies/lists';
import { countriesLists } from './countries/lists';
import { moviesLists } from './movies/lists';

export async function fetchLogoLists(logoSet: LogoSetKey): Promise<LogoList[]> {
  switch (logoSet) {
    case 'companies':
      return companiesLists;

    case 'movies':
      return moviesLists;

    case 'countries':
      return countriesLists;

    default:
      return [];
  }
}
