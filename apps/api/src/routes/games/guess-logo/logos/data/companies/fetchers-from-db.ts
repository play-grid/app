import type { CompanyLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';

interface StatItemResponse {
  id: string;
  name: string;
  nameAr: string | null;
  imageUrl: string | null;
  hint: string | null;
}

interface StatItemsAPIResponse {
  items: StatItemResponse[];
}

export async function fetchCompaniesFromDB(
  category: string,
  language: SupportedLanguage,
): Promise<CompanyLogo[]> {
  const baseUrl = '/data/stat-items';
  const url = `${baseUrl}?category=${category}&lang=${language}&status=approved&limit=1000`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.statusText}`);
  }

  const data = await response.json() as StatItemsAPIResponse;

  return data.items.map((item, index) => ({
    id: index,
    name: language === 'ar' ? item.nameAr || item.name : item.name,
    imageUrl: item.imageUrl || '',
    type: LOGO_SET_TYPE_MAP.companies,
  })).filter(logo => logo.imageUrl);
}
