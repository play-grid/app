import { useEffect } from 'react';
import { devLog } from '@/utils/logger';
import { useGameStore } from '../../stores/game-state-store';
import { useGameConnection } from './use-game-connection';

// Define the message structure from the server
interface GameServerMessage {
  type: 'GAME_STATE_UPDATE' | 'ERROR' | 'GAME_NOT_FOUND';
  payload: any;
}

function getWebSocketUrl(roomId: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  // This assumes the API is served from the same host as the frontend.
  // In production, you might need a more robust way to set the API host.
  return `${protocol}//${host}/api/game-room/${roomId}/ws`;
}

export function useGameRoomManager(roomId?: string) {
  const { applyServerState } = useGameStore();

  const wsUrl = roomId ? getWebSocketUrl(roomId) : '';

  const { onMessage, sendAction, connectionStatus } = useGameConnection(wsUrl);

  useEffect(() => {
    if (onMessage) {
      devLog('Received message from server:', onMessage);
      const message = onMessage as GameServerMessage;

      switch (message.type) {
        case 'GAME_STATE_UPDATE':
          applyServerState(message.payload);
          break;
        case 'ERROR':
          // You might want to set this error in the UI store
          console.error('Server Error:', message.payload);
          break;
        case 'GAME_NOT_FOUND':
          // Handle game not found, e.g., redirect or show an error
          console.error('Game not found');
          break;
        default:
          devLog('Unknown message type:', message.type);
      }
    }
  }, [onMessage, applyServerState]);

  return { sendAction, connectionStatus };
}
