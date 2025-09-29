import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { saudiCompanies } from '@guess-logo/shared/data';
import { fetchCompanyLogo } from './fetch-company-logo';

export async function saudiCompanyList(_language: SupportedLanguage): Promise<LogoItem[]> {
  const logoPromises = saudiCompanies.logos.map(async (name, index) => {
    const imageUrl = await fetchCompanyLogo(name);
    return {
      id: index,
      name,
      imageUrl: imageUrl || '',
      eliminated: false,
    };
  });
  return Promise.all(logoPromises);
}
