import type { StatItemTransformer } from '../types';
import { LogoDevClient } from '../sources/logo-dev';

export interface Company {
  nameEn: string;
  nameAr: string | null;
  listId: string;
}

export interface CompaniesTransformerConfig {
  apiKey: string;
  listId: string;
  fetchCompanies: (listId: string) => Promise<Company[]>;
}

export function createCompaniesTransformer(config: CompaniesTransformerConfig): StatItemTransformer<Company> {
  const client = new LogoDevClient({
    baseUrl: 'https://api.logo.dev',
    apiKey: config.apiKey,
  });

  return {
    source: 'logo-dev',
    category: config.listId,

    async fetch() {
      return await config.fetchCompanies(config.listId);
    },

    async transform(company) {
      const logoUrl = await client.getLogoUrl(company.nameEn);

      return [{
        entity: 'company',
        externalId: company.nameEn.toLowerCase().replace(/[^a-z0-9]/g, ''),
        category: config.listId,
        name: company.nameEn,
        nameAr: company.nameAr || null,
        metricType: 'brand',
        value: 1,
        unit: 'company',
        unitAr: 'شركة',
        imageUrl: logoUrl || null,
        hint: company.nameEn,
        hintAr: company.nameAr || null,
        source: 'logo-dev',
        status: 'approved',
      }];
    },
  };
}
