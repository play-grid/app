import type { LogoSetKey } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { fetchLogos } from '../services/logo-query-service';

export function logoItemsQueryOptions(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  shuffle: boolean,
  enabled = true,
): UseQueryOptions {
  return {
    queryKey: ['logo-items', logoSet, listId, language, count, shuffle],
    queryFn: () => fetchLogos(logoSet, listId, language, count, shuffle),
    enabled: enabled && !!logoSet && !!listId,
    staleTime: 30 * 60 * 1000,
    gcTime: 86400 * 7 * 1000,
  };
}

export function useLogoItems(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  enabled = true,
) {
  return useQuery(logoItemsQueryOptions(logoSet, listId, language, count, false, enabled));
}
