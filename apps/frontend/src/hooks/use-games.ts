import type { GameMeta } from '@guess-logo/shared/schemas';
import { queryOptions, useQuery } from '@tanstack/react-query';
import client from '@/lib/hono-client';

const FALLBACK_GAMES: GameMeta[] = [
  {
    id: 'five-seconds',
    version: '1.0.0',
    name: {
      en: 'Five Seconds',
      ar: 'خمس ثواني',
    },
    description: {
      en: 'Answer questions as fast as you can in five seconds!',
      ar: 'أجب على الأسئلة بأسرع ما يمكن في خمس ثوانٍ!',
    },
    imageUrl: 'https://pub-9df3c09e2c264f328b6770ef318b615e.r2.dev/games/5s-bg.jpg',
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: 'guess-logo',
    version: '1.0.0',
    name: {
      en: 'Guess the Logo',
      ar: 'خمن الشعار',
    },
    description: {
      en: 'Guess the logos of famous companies and brands!',
      ar: 'خمن شعارات الشركات والعلامات التجارية الشهيرة!',
    },
    minPlayers: 2,
    maxPlayers: 2,
    imageUrl: 'https://pub-9df3c09e2c264f328b6770ef318b615e.r2.dev/games/guess-logo-game-img.png',
  },
];
export function gamesQueryOptions() {
  return queryOptions({
    queryKey: ['games'],
    queryFn: async () => {
      try {
        const res = await client.api.games.$get();
        if (!res.ok)
          throw new Error('Failed to fetch games');
        const data = await res.json();
        return data;
      }
      catch {
        return FALLBACK_GAMES;
      }
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 86400 * 7 * 1000,
    refetchOnMount: false,
  });
}

export function useGames() {
  return useQuery(gamesQueryOptions());
}
