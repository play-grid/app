import { useQuery } from '@tanstack/react-query';
import { getCategoryById } from '../services/category.service';

export function useCategory(id: string) {
  return useQuery({ queryKey: ['categories', id], queryFn: () => getCategoryById({ id }), staleTime: 10 * 60 * 1000, gcTime: 20 * 60 * 1000 });
}
