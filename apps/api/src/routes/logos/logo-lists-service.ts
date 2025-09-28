import type { LogoList, LogoSetKey } from '@guess-logo/shared/types/logos';
import { companyList } from './companies/company-list-service';
import { countriesLists } from './countries/lists';
import { moviesLists } from './movies/lists';
import { sportLists } from './sport/sport-list-service';

export async function fetchLogoLists(logoSet: LogoSetKey): Promise<LogoList[]> {
  switch (logoSet) {
    case 'companies':
      return [{ id: 'companies', name: 'companies', fetchItems: companyList }];

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
