import { useState } from 'react';
import { useWebSocket } from '../use-web-socket';

type ConnectionStatus = 'connected' | 'disconnected';

export function useGameConnection(url: string) {
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  const { send, isConnected } = useWebSocket(url, setLastMessage);

  const connectionStatus: ConnectionStatus = isConnected ? 'connected' : 'disconnected';

  return {
    sendAction: send,
    onMessage: lastMessage,
    connectionStatus,
  };
}
