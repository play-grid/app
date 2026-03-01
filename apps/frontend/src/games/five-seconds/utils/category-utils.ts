import type { categoryBaseSchema } from '@playgrid/five-seconds';
import type { SupportedLanguage } from '@playgrid/shared/types';
import type { z } from 'zod';

export type Category = z.infer<typeof categoryBaseSchema>;

export function getLocalizedCategoryName(
  category: Category,
  language: SupportedLanguage,
): string {
  return language === 'ar' ? category.nameAr : category.nameEn;
}
