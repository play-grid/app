import { queryOptions, useQuery } from '@tanstack/react-query';
import { getCategoryById } from '../services/category.service';

export function categoryQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById({ id }),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

export function useCategory(id: string) {
  return useQuery(categoryQueryOptions(id));
}
