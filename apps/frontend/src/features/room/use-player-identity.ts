import { useMemo } from 'react';
import { useGameMode } from '@/hooks/use-game-mode';
import { useRoomSession } from './room-store';

export function useCurrentUserId(): string | null {
  const { session } = useRoomSession();
  return session?.playerId ?? null;
}

export function useIsCurrentUser(playerId: string): boolean {
  const { isMultiplayer } = useGameMode();
  const currentUserId = useCurrentUserId();

  return useMemo(() => {
    if (!isMultiplayer) {
      return true;
    }
    return playerId === currentUserId;
  }, [isMultiplayer, playerId, currentUserId]);
}

export function useIsNotCurrentUser(playerId: string): boolean {
  const isCurrentUser = useIsCurrentUser(playerId);
  return useMemo(() => !isCurrentUser, [isCurrentUser]);
}

export function useCurrentUserPlayer<TPlayer extends { id: string }>(
  players: Record<string, TPlayer>,
): TPlayer | undefined {
  const currentUserId = useCurrentUserId();
  return useMemo(() => {
    return currentUserId ? players[currentUserId] : undefined;
  }, [currentUserId, players]);
}
