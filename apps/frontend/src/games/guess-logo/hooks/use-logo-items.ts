import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { LogoSetKey } from '../lib/logo-data';
import type { LogoItem } from '../stores/game-state-store';
import { useQuery } from '@tanstack/react-query';
import { fetchLogos } from '../services/unified-logo-service';

/**
 * Query options factory for logo items
 * This ensures consistent query keys across the app
 */
export function logoItemsQueryOptions(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  shuffle = false,
  enabled = true,
): UseQueryOptions<LogoItem[]> {
  return {
    queryKey: ['logo-items', logoSet, listId, language, count],
    queryFn: () => fetchLogos(logoSet, listId, language, count, shuffle),
    enabled: enabled && !!logoSet && !!listId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 86400 * 7 * 1000, // 7 days
    refetchOnMount: false,
  };
}

/**
 * Hook for fetching logo items
 */
export function useLogoItems(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  enabled = true,
) {
  return useQuery<LogoItem[]>(
    logoItemsQueryOptions(logoSet, listId, language, count, false, enabled),
  );
}
