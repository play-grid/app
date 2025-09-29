import type { LogoList } from '@guess-logo/shared/types';
import { countriesList } from './countries-list';

export const countriesLists: LogoList[] = [
  {
    id: 'countries',
    name: 'Countries',
    fetchItems: countriesList,
  },
];
