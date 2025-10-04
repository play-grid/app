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
    fetchItems: companyList,
  },
  {
    id: 'saudi',
    name: {
      en: 'Saudi Companies',
      ar: 'شركات سعودية',
    },
    fetchItems: saudiCompanyList,
  },
];
