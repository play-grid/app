import type { LogoItem } from '@/types';
import type { SupportedLanguage } from '@/utils/language-utils';
import companies from '@/data/companies.json';

export async function companyList(_language: SupportedLanguage): Promise<LogoItem[]> {
  return companies.logos.map((name, index) => ({
    id: index,
    name,
    imageUrl: '',
    eliminated: false,
  }));
}
