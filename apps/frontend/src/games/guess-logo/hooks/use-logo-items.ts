import type { LogoSetKey } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { fetchLogos } from '../services/logo-query-service';

export function useLogoItems(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  enabled = true,
) {
  return useQuery({
    queryKey: ['logo-items', logoSet, listId, language],
    queryFn: () => fetchLogos(logoSet, listId, language, 100),
    enabled: enabled && !!logoSet && !!listId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
