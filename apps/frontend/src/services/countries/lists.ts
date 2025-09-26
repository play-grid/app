import type { LogoList } from '@/types/logo-item';
import { countriesList } from './countries-list';

export const countriesLists: LogoList[] = [
  {
    id: 'countries',
    name: 'Countries',
    fetchItems: countriesList,
  },
];
