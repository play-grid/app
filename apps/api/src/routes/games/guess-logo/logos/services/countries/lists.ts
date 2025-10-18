import type { LogoList } from '@guess-logo/shared/types';
import { gdpList } from './gdp-list-service';
import { populationList } from './population-list-service';

export const countriesLists: LogoList[] = [
  {
    id: 'countries',
    name: {
      en: 'Countries',
      ar: 'دول',
    },
    fetchItems: gdpList,
  },
  {
    id: 'top-population',
    name: {
      en: 'Highest population density countries',
      ar: 'أعلى دول كثافة سكانية',
    },
    fetchItems: populationList,
  },
];
