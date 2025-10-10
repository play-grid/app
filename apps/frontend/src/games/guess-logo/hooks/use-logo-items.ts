import type { LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { fetchLogoItems } from '../services/logo-items-service';

export function useLogoItems(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  enabled = true,
) {
  return useQuery({
    queryKey: ['logo-items', logoSet, listId, language],
    queryFn: () => fetchLogoItems(logoSet, listId, language),
    enabled: enabled && !!logoSet && !!listId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
