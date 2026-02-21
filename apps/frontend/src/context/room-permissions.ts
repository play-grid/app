import type { Player } from '@guess-logo/game-core';
import { useMemo } from 'react';
import { useGameMode } from '@/hooks/use-game-mode';
import { useRoomSession } from '../features/room/room-store';

interface RoomPermissions {
  canManagePlayers: boolean;
  canEditSettings: boolean;
  canKickPlayers: boolean;
  canStartGame: boolean;
  canVoteToKick: boolean;
  isHost: boolean;
  isInRoom: boolean;
}

export function useRoomPermissions(players: Record<string, Player>): RoomPermissions {
  const { canUseMultiplayerFeatures } = useGameMode();
  const { session } = useRoomSession();

  return useMemo(() => {
    // In local mode, permissions are open as everyone is a host.
    if (!canUseMultiplayerFeatures) {
      return {
        canManagePlayers: true,
        canEditSettings: true,
        canKickPlayers: true,
        canStartGame: true,
        canVoteToKick: false,
        isHost: true,
        isInRoom: false,
      };
    }

    const isInRoom = true;
    const currentPlayer = session?.playerId ? players[session.playerId] : undefined;
    const isHost = currentPlayer?.isHost || false;

    return {
      canManagePlayers: isHost,
      canEditSettings: isHost,
      canKickPlayers: isHost,
      canStartGame: isHost,
      canVoteToKick: isInRoom && !isHost,
      isHost,
      isInRoom,
    };
  }, [canUseMultiplayerFeatures, session?.playerId, players]);
}

export function useRoomPermissionsBasic(): Pick<RoomPermissions, 'isInRoom'> {
  const { canUseMultiplayerFeatures } = useGameMode();

  return useMemo(() => ({
    isInRoom: canUseMultiplayerFeatures,
  }), [canUseMultiplayerFeatures]);
}
