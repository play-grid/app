import type { categoryBaseSchema } from '@guess-logo/five-seconds';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { z } from 'zod';

export type Category = z.infer<typeof categoryBaseSchema>;

export function getLocalizedCategoryName(
  category: Category,
  language: SupportedLanguage,
): string {
  return language === 'ar' ? category.nameAr : category.nameEn;
}
