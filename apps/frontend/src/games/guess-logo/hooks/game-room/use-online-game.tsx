import { useGameRoomManager } from './use-game-room-manager';

export function useOnlineGame(roomId?: string) {
  const { sendAction, connectionStatus } = useGameRoomManager(roomId);

  return {
    sendAction,
    connectionStatus,
  };
}
