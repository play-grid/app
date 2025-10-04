import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { saudiCompanies } from '@guess-logo/shared/data';
import { fetchCompanyLogo } from './fetch-company-logo';

export async function saudiCompanyList(language: SupportedLanguage): Promise<LogoItem[]> {
  const logoPromises = saudiCompanies.logos.map(async (logo, index) => {
    const imageUrl = await fetchCompanyLogo(logo.en); // Use English name for fetching logo
    return {
      id: index,
      name: logo[language], // Use the name in the requested language
      originalName: logo.en, // Store the original English name
      imageUrl: imageUrl || '',
      eliminated: false,
    };
  });
  return Promise.all(logoPromises);
}
