import type { Player } from '@guess-logo/game-core';
import { useMemo } from 'react';
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
  const { session } = useRoomSession();

  return useMemo(() => {
    const isMultiplayer = !!session?.playerId;

    // In local mode, there's no session, so permissions are open as everyone is a host.
    if (!isMultiplayer) {
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
    const currentPlayer = players[session.playerId!];
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
  }, [session?.playerId, players]);
}

export function useRoomPermissionsBasic(): Pick<RoomPermissions, 'isInRoom'> {
  const { session } = useRoomSession();

  return useMemo(() => ({
    isInRoom: !!session?.playerId,
  }), [session?.playerId]);
}
