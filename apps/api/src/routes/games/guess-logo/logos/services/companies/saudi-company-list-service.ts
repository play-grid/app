import type { CompanyLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';
import { logoOverrides, saudiCompanies } from '@guess-logo/shared/data';
import { processInChunks } from '@/utils/promise-utils';
import { fetchCompanyLogo } from './fetch-company-logo';

const CHUNK_SIZE = 10;

export async function saudiCompanyList(
  language: SupportedLanguage,
  listId: string = 'saudi',
): Promise<CompanyLogo[]> {
  const results = await processInChunks(
    saudiCompanies.logos,
    async (logo, index) => {
      const overrideKey = logo.en;
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      const overrideUrl = logoOverrides.sets?.companies?.[listId]?.[overrideKey];

      let imageUrl: string | null = null;

      if (overrideUrl) {
        imageUrl = overrideUrl;
      }
      else {
        const result = await fetchCompanyLogo(logo.en);
        imageUrl = result.logo;
      }

      return {
        id: index,
        name: logo[language], // Localized name
        imageUrl: imageUrl || '',
        type: LOGO_SET_TYPE_MAP.companies,
      };
    },
    CHUNK_SIZE,
  );
  return results.filter((logo): logo is CompanyLogo => !!logo.imageUrl);
}
