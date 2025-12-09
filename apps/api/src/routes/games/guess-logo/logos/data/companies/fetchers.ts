import type { CompanyLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';
import { companies, saudiCompanies } from '@guess-logo/shared/data';
import { processInChunks } from '@/utils/promise-utils';
import { fetchCompanyLogo } from '../../services/companies/fetch-company-logo';

const CHUNK_SIZE = 10;

export async function fetchCompaniesGeneral(
  language: SupportedLanguage,
): Promise<CompanyLogo[]> {
  const results = await processInChunks(
    companies.logos,
    async (logo, index) => {
      const result = await fetchCompanyLogo(logo.en);

      return {
        id: index,
        name: logo[language],
        imageUrl: result.logo || '',
        type: LOGO_SET_TYPE_MAP.companies,
      };
    },
    CHUNK_SIZE,
  );

  return results.filter((logo): logo is CompanyLogo => !!logo.imageUrl);
}

export async function fetchSaudiCompanies(
  language: SupportedLanguage,
): Promise<CompanyLogo[]> {
  const results = await processInChunks(
    saudiCompanies.logos,
    async (logo, index) => {
      const result = await fetchCompanyLogo(logo.en);

      return {
        id: index,
        name: logo[language],
        imageUrl: result.logo || '',
        type: LOGO_SET_TYPE_MAP.companies,
      };
    },
    CHUNK_SIZE,
  );

  return results.filter((logo): logo is CompanyLogo => !!logo.imageUrl);
}
