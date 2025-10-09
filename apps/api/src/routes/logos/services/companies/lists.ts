import type { LogoList } from '@guess-logo/shared/types';
import { companyList } from './company-list-service';
import { saudiCompanyList } from './saudi-company-list-service';

export const companiesLists: LogoList[] = [
  {
    id: 'companies',
    name: {
      en: 'Companies',
      ar: 'شركات',
    },
    fetchItems: async (language, listId) => companyList(language, listId || 'companies'),
  },
  {
    id: 'saudi',
    name: {
      en: 'Saudi Companies',
      ar: 'شركات سعودية',
    },
    fetchItems: async (language, listId) => saudiCompanyList(language, listId || 'saudi'),
  },
];
