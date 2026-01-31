import type { UseQueryOptions } from '@tanstack/react-query';
import type { LogoSetKey } from '../lib/logo-data';
import { useQuery } from '@tanstack/react-query';
import { fetchLogoLists } from '../services/unified-logo-service';

export function logoListsQueryOptions(logoSet: LogoSetKey, enabled = true): UseQueryOptions {
  return {
    queryKey: ['logo-lists', logoSet],
    queryFn: () => fetchLogoLists(logoSet),
    enabled: enabled && !!logoSet,
    staleTime: 60 * 60 * 1000,
    gcTime: 86400 * 7 * 1000,
  };
}

export function useLogoListsQuery(logoSet: LogoSetKey, enabled = true) {
  return useQuery(logoListsQueryOptions(logoSet, enabled));
}
