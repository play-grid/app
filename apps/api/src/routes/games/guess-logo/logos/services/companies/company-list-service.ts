import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { companies, logoOverrides } from '@guess-logo/shared/data';
import { processInChunks } from '@/utils/promise-utils';
import { fetchCompanyLogo } from './fetch-company-logo';

const CHUNK_SIZE = 10;

export async function companyList(
  language: SupportedLanguage,
  listId: string = 'companies',
): Promise<LogoItem[]> {
  const results = await processInChunks(
    companies.logos,
    async (logo, index) => {
      const overrideKey = logo.en;
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      const overrideUrl = logoOverrides.sets?.companies?.[listId]?.[overrideKey];

      let imageUrl: string | null = null;
      let apiName: string | null = null;

      if (overrideUrl) {
        imageUrl = overrideUrl;
        apiName = logo.en;
      }
      else {
        const result = await fetchCompanyLogo(logo.en);
        imageUrl = result.logo;
        apiName = result.name;
      }

      return {
        id: index,
        name: logo[language], // Localized name
        originalName: apiName || logo.en, // API name or fallback
        imageUrl: imageUrl || '',
        eliminated: false,
      };
    },
    CHUNK_SIZE,
  );

  return results;
}
