import type { SupportedLanguage } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { getCategoryById } from '../services/category.service';

export function useCategory(id: string, language: SupportedLanguage) {
  return useQuery({ queryKey: ['categories', id, language], queryFn: () => getCategoryById({ id, language }), staleTime: 10 * 60 * 1000, gcTime: 20 * 60 * 1000 });
}
