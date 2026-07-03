import type { SupportedLanguage } from '@playgrid/shared/types';
import type { LogoSetKey } from '../lib/logo-data';
import type { LogoItem } from '../stores/game-state.types';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchLogos } from '../services/unified-logo-service';

export function logoItemsQueryOptions(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  shuffle = false,
  enabled = true,
) {
  return queryOptions<LogoItem[]>({
    queryKey: ['logo-items', logoSet, listId, language, count],
    queryFn: () => fetchLogos(logoSet, listId, language, count, shuffle),
    enabled: enabled && !!logoSet && !!listId,
    staleTime: 30 * 60 * 1000,
    gcTime: 86400 * 7 * 1000,
    refetchOnMount: false,
  });
}

export function useLogoItems(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  enabled = true,
) {
  return useQuery(
    logoItemsQueryOptions(logoSet, listId, language, count, false, enabled),
  );
}
