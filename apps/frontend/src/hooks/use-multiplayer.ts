import { useEffect, useState } from 'react';
import { joinGameRoom } from '@/features/room/room-service';
import { logger } from '@/utils/logger';
import { useGameMode } from './use-game-mode';

export interface PlayerIdentity {
  id: string;
  name: string;
}

export function useMultiplayer() {
  const { isMultiplayer, roomId } = useGameMode();
  const [player, setPlayer] = useState<PlayerIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const storageKey = `player-${roomId}`;

  useEffect(() => {
    if (!isMultiplayer || !roomId)
      return;
    try {
      const storedPlayer = localStorage.getItem(storageKey);
      if (storedPlayer) {
        setPlayer(JSON.parse(storedPlayer));
      }
    }
    catch (e) {
      logger.error(e, 'Failed to parse player from localStorage');
      localStorage.removeItem(storageKey);
    }
  }, [isMultiplayer, roomId, storageKey]);

  const joinRoom = async (playerName: string) => {
    if (!isMultiplayer || !roomId) {
      const err = 'Not in multiplayer mode';
      setError(err);
      return { success: false, error: err };
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await joinGameRoom(roomId, { playerName });

      const newPlayer = { id: data.player.id, name: data.player.name };
      localStorage.setItem(storageKey, JSON.stringify(newPlayer));
      setPlayer(newPlayer);
      return { success: true, player: newPlayer };
    }
    catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
    finally {
      setIsLoading(false);
    }
  };

  const hasJoined = !!player;

  return { isMultiplayer, roomId, currentPlayer: player, hasJoined, joinRoom, isLoading, error };
}
