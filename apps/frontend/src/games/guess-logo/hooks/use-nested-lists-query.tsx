import type { LogoSetKey } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { fetchNestedLists } from '../services/unified-logo-service';

/**
 * TanStack Query hook for fetching nested lists (e.g., leagues within a sports region)
 * Only works for sports logo set
 */
export function useNestedListsQuery(
  logoSet: LogoSetKey,
  parentListId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['nested-lists', logoSet, parentListId],
    queryFn: () => fetchNestedLists(logoSet, parentListId),
    enabled: enabled && !!logoSet && !!parentListId && logoSet === 'sports',
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
  });
}
