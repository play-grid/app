import { useQuery } from '@tanstack/react-query';
import { getCategoriesList } from '../services/categories.service';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => getCategoriesList(), staleTime: 10 * 60 * 1000, gcTime: 20 * 60 * 1000 });
}
