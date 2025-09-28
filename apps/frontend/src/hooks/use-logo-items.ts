import type { LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { fetchLogoLists } from '@/services/logo-lists-service';

export function useLogoItems(logoSet: LogoSetKey, listId: string, language: SupportedLanguage, enabled = true) {
  return useQuery({
    queryKey: ['logo-items', logoSet, listId, language],
    queryFn: async () => {
      if (!listId) {
        return [];
      }
      const lists = await fetchLogoLists(logoSet);
      const list = lists.find(l => l.id === listId);
      if (list?.fetchItems) {
        const items = await list.fetchItems(language);
        return items;
      }
      return [];
    },
    enabled: enabled && !!logoSet && !!listId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
