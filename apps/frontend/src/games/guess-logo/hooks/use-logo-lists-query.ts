import type { LogoSetKey } from '@playgrid/guess-logo';
import type { LogoListMetadata } from '../components/sports-list-selector';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchLogoLists } from '../services/unified-logo-service';

export function logoListsQueryOptions(logoSet: LogoSetKey, enabled = true) {
  return queryOptions<LogoListMetadata[]>({
    queryKey: ['logo-lists', logoSet],
    queryFn: () => fetchLogoLists(logoSet),
    enabled: enabled && !!logoSet,
    staleTime: 60 * 60 * 1000,
    gcTime: 86400 * 7 * 1000,
  });
}

export function useLogoListsQuery(logoSet: LogoSetKey, enabled = true) {
  return useQuery(logoListsQueryOptions(logoSet, enabled));
}
