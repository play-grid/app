import type { LogoSetKey } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { LogoItem } from '../stores/game-state-store';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchLogos } from '../services/logo-query-service';

export function logosQueryOptions(
  logoItems: LogoItem[],
  logoSet: LogoSetKey,
  language: SupportedLanguage,
  listId: string,
  enabled = true,
) {
  return queryOptions({
    queryKey: ['logos', logoSet, listId, logoItems.length, language],
    queryFn: () => fetchLogos(logoSet, listId, language, logoItems.length),
    enabled: enabled && logoItems.length > 0,
    staleTime: 30 * 60 * 1000,
    gcTime: 86400 * 7 * 1000,
    refetchOnMount: false,
  });
}

export function useLogoQuery(
  logoItems: LogoItem[],
  logoSet: LogoSetKey,
  language: SupportedLanguage,
  listId: string,
  enabled = true,
) {
  return useQuery(logosQueryOptions(logoItems, logoSet, language, listId, enabled));
}
