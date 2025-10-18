import type { LanguageQuery } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { getCategoriesList } from '../services/categories.service';

export function useCategories(language: LanguageQuery) {
  return useQuery({ queryKey: ['categories', language], queryFn: () => getCategoriesList(language), staleTime: 10 * 60 * 1000, gcTime: 20 * 60 * 1000 });
}
