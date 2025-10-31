import { createORPCClient } from '@orpc/client';
import { RPCLink as FetchRPCLink } from '@orpc/client/fetch';
import { RPCLink as WebSocketRPCLink } from '@orpc/client/websocket';
import PartySocket from 'partysocket';

export interface NetworkClientConfig {
  httpUrl: string;
  wsUrl?: string;
  roomId?: string;
  headers?: () => Record<string, string>;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class NetworkClient<TContract = any> {
  private httpClient: ReturnType<typeof createORPCClient>;
  private wsClient?: ReturnType<typeof createORPCClient>;
  private partySocket?: PartySocket;
  private isConnected = false;

  constructor(private config: NetworkClientConfig) {
    // Create HTTP client with RPCLink
    const httpLink = new FetchRPCLink({
      url: config.httpUrl,
      headers: config.headers,
      fetch: fetch.bind(globalThis),
    });

    this.httpClient = createORPCClient(httpLink);

    // WebSocket setup for real-time updates (optional)
    if (config.wsUrl) {
      this.setupWebSocket();
    }
  }

  private setupWebSocket() {
    if (!this.config.wsUrl)
      return;

    // Use PartySocket for automatic reconnection
    this.partySocket = new PartySocket({
      host: this.config.wsUrl,
      room: this.config.roomId || 'default',
    });

    this.partySocket.addEventListener('open', () => {
      this.isConnected = true;
      this.config.onConnect?.();
      console.log('WebSocket connected');
    });

    this.partySocket.addEventListener('close', () => {
      this.isConnected = false;
      this.config.onDisconnect?.();
      console.log('WebSocket disconnected');
    });

    this.partySocket.addEventListener('error', (event) => {
      const error = new Error('WebSocket error');
      this.config.onError?.(error);
      console.error('WebSocket error:', event);
    });

    this.partySocket.addEventListener('open', () => {
      if (this.partySocket) {
        const wsLink = new WebSocketRPCLink({
          websocket: this.partySocket as any,
        });
        this.wsClient = createORPCClient(wsLink);
      }
    });
  }

  getClient(): TContract {
    return this.httpClient as TContract;
  }

  getWebSocketClient(): TContract | undefined {
    return this.wsClient as TContract | undefined;
  }

  getSocket() {
    return this.partySocket;
  }

  isSocketConnected() {
    return this.isConnected;
  }

  disconnect() {
    this.partySocket?.close();
  }
}

export function createNetworkClient<TContract>(config: NetworkClientConfig): NetworkClient<TContract> {
  return new NetworkClient<TContract>(config);
}
