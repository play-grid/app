import type { GameMeta } from '@guess-logo/shared/schemas';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/hono-client';

/**
 * Query options factory for games
 * This ensures consistent query keys across the app
 */
export function gamesQueryOptions(): UseQueryOptions<GameMeta[]> {
  return {
    queryKey: ['games'],
    queryFn: async () => {
      const res = await client.api.games.$get();
      if (!res.ok)
        throw new Error('Failed to fetch games');
      const data = await res.json();
      return data;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 86400 * 7 * 1000,
    refetchOnMount: false,
  };
}

/**
 * Hook for fetching games using ensureQueryData
 * This prevents refetching when navigating back to home page
 */
export function useGames() {
  const queryClient = useQueryClient();
  
  return useQuery<GameMeta[]>({
    ...gamesQueryOptions(),
    queryFn: async () => {
      return queryClient.ensureQueryData(gamesQueryOptions());
    },
  });
}
