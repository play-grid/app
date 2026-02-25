import type { CompanyLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { Context } from 'hono';
import type { AppEnv } from '@/lib/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';
import { fetchStatItems } from '@/services/stat-items.service';

export async function fetchCompaniesFromDB(
  category: string,
  language: SupportedLanguage,
  c: Context<AppEnv>,
): Promise<CompanyLogo[]> {
  const items = await fetchStatItems(c, {
    category,
    lang: language,
    status: 'approved',
    limit: 1000,
  });

  return items.map((item, index) => ({
    id: index,
    name: language === 'ar' ? item.nameAr || item.name : item.name,
    imageUrl: item.imageUrl || '',
    type: LOGO_SET_TYPE_MAP.companies,
  })).filter(logo => logo.imageUrl);
}
