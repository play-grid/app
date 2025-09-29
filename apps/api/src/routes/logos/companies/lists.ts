import type { LogoList } from '@guess-logo/shared/types';
import { companyList } from './company-list-service';
import { saudiCompanyList } from './saudi-company-list-service';

export const companiesLists: LogoList[] = [{ id: 'companies', name: 'companies', fetchItems: companyList }, { id: 'saudi', name: 'Top Saudi Companies', fetchItems: saudiCompanyList }];
