import type { LogoList, LogoSetKey } from '@guess-logo/shared/types/logos';
import { companiesLists } from './companies/lists';
import { countriesLists } from './countries/lists';
import { moviesLists } from './movies/lists';
import { sportLists } from './sport/sport-list-service';

export async function fetchLogoLists(logoSet: LogoSetKey): Promise<LogoList[]> {
  switch (logoSet) {
    case 'companies':
      return companiesLists;

    case 'movies':
      return moviesLists;

    case 'countries':
      return countriesLists;

    case 'sports':
      return sportLists;

    default:
      return [];
  }
}
