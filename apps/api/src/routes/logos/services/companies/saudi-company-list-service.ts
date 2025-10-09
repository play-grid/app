import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { logoOverrides, saudiCompanies } from '@guess-logo/shared/data';
import { fetchCompanyLogo } from './fetch-company-logo';

export async function saudiCompanyList(
  language: SupportedLanguage,
  listId: string = 'saudi',
): Promise<LogoItem[]> {
  const logoPromises = saudiCompanies.logos.map(async (logo, index) => {
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
  });

  const results = await Promise.all(logoPromises);
  return results;
}
