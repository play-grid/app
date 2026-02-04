import { queryOptions, useQuery } from '@tanstack/react-query';
import { getCategoriesList } from '../services/categories.service';

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: ['categories'],
    queryFn: () => getCategoriesList(),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery(categoriesQueryOptions());
}
