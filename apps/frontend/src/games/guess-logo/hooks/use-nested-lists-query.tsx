import type { LogoSetKey } from '@playgrid/guess-logo';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { LogoListMetadata } from '../components/sports-list-selector';
import { useQuery } from '@tanstack/react-query';
import { fetchNestedLists } from '../services/unified-logo-service';

/**
 * Query options factory for nested lists
 * This ensures consistent query keys across the app
 */
export function nestedListsQueryOptions(
  logoSet: LogoSetKey,
  parentListId: string,
  enabled = true,
): UseQueryOptions<LogoListMetadata[]> {
  return {
    queryKey: ['nested-lists', logoSet, parentListId],
    queryFn: () => fetchNestedLists(logoSet, parentListId),
    enabled: enabled && !!logoSet && !!parentListId && logoSet === 'sports',
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
  };
}

/**
 * TanStack Query hook for fetching nested lists (e.g., leagues within a sports region)
 * Only works for sports logo set
 */
export function useNestedListsQuery(
  logoSet: LogoSetKey,
  parentListId: string,
  enabled = true,
) {
  return useQuery(nestedListsQueryOptions(logoSet, parentListId, enabled));
}
