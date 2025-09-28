import type { LogoItem, LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { fetchLogos } from '@/services/logo-query-service';

export function useLogoQuery(
  logoItems: LogoItem[],
  logoSet: LogoSetKey,
  language: SupportedLanguage,
  listId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['logos', logoSet, listId, logoItems.length, language],
    queryFn: () => fetchLogos(logoSet, listId, language, logoItems.length),
    enabled: enabled && logoItems.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
  });
}
