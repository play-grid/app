import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';

type MessageHandler = (data: any) => void;

export function useWebSocket(url: string, onMessage?: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Send message helper
  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!url) {
      return;
    }

    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        logger.debug('✅ WS connected');
      };

      ws.onclose = () => {
        setIsConnected(false);
        logger.debug('⚠️ WS disconnected, retrying...');
        reconnectTimer = setTimeout(connect, 2000); // simple retry
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMessage?.(parsed);
        }
        catch {
          onMessage?.(event.data);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        // Nullify the onclose handler to prevent the reconnect logic from firing
        // during the cleanup phase of React's StrictMode double-effect invocation.
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [url, onMessage]);

  return { send, isConnected };
}
