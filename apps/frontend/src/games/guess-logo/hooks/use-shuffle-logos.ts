import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { LogoSetKey } from '../lib/logo-data';
import type { LogoItem } from '../stores/game-state-store';
import { useQueryClient } from '@tanstack/react-query';
import { fetchLogos } from '../services/logo-query-service';
import { useGameStore } from '../stores/game-state-store';

export function useShuffleLogos(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  currentCount: number,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const { setGameLogos } = useGameStore();

  return {
    shuffleLogos: async () => {
      if (!enabled) {
        return;
      }

      try {
        const allLogos = await queryClient.fetchQuery({
          queryKey: ['logo-items', logoSet, listId, language, 100],
          queryFn: () => fetchLogos(logoSet, listId, language, 100, false),
          staleTime: 30 * 60 * 1000,
        });

        if (!allLogos || allLogos.length === 0) {
          throw new Error('No logos available to shuffle');
        }

        const shuffled = [...allLogos].sort(() => Math.random() - 0.5);
        const newLogos: LogoItem[] = shuffled.slice(0, currentCount).map((logo, index) => ({
          id: index,
          name: logo.name,
          imageUrl: logo.imageUrl,
          eliminated: false,
          countryData: logo.countryData,
          type: logo.type,
        }));

        setGameLogos(newLogos);
      }
      catch (error) {
        console.error('Failed to shuffle logos', error);
        throw error;
      }
    },
  };
}
