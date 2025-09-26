import type { LogoSetKey } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { fetchLogoLists } from '@/services/logo-lists-service';

export function useLogoListsQuery(logoSet: LogoSetKey, enabled = true) {
  return useQuery({
    queryKey: ['logo-lists', logoSet],
    queryFn: () => fetchLogoLists(logoSet),
    enabled: enabled && !!logoSet,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
