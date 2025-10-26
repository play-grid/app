import type { ClientDurableIterator } from '@orpc/experimental-durable-iterator/client';
import type { gameContract, GameEventType } from '../multiplayer/orpc-contract';
import type { BaseGameStateWire } from '../types/core';
import { createORPCClient, RPCLink } from '@orpc/client';

import { DurableIteratorLinkPlugin } from '@orpc/experimental-durable-iterator/client';
import PartySocket from 'partysocket';

export interface NetworkClientConfig {
  roomId: string;
  baseUrl: string;
  signingKey: string;
  playerId?: string;
  playerName?: string;
  metadata?: Record<string, any>;

  // PartySocket options
  reconnectAttempts?: number;
  reconnectDelay?: number;
  minReconnectDelay?: number;
  maxReconnectDelay?: number;

  // Debug
  debug?: boolean;
}

/**
 * Network client that connects to Durable Object via oRPC + Durable Iterator
 * Uses PartySocket for automatic reconnection with exponential backoff
 */
export function createNetworkClient(config: NetworkClientConfig) {
  const {
    roomId,
    baseUrl,
    signingKey,
    playerId,
    playerName,
    metadata,
    reconnectAttempts = Infinity,
    reconnectDelay = 1000,
    minReconnectDelay = 1000,
    maxReconnectDelay = 30000,
    debug = false,
  } = config;

  let isConnected = false;
  let iterator: ClientDurableIterator<any, any> | null = null;
  let partySocket: PartySocket | null = null;

  // Parse URLs
  const httpUrl = baseUrl.replace(/^ws/, 'http');
  const wsUrl = baseUrl.replace(/^http/, 'ws');

  // Create PartySocket for automatic reconnection
  partySocket = new PartySocket({
    host: wsUrl,
    room: roomId,

    // Reconnection config
    maxReconnectionDelay: maxReconnectDelay,
    minReconnectionDelay: minReconnectDelay,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,

    // Debug
    debug,
  });

  // Setup event listeners
  partySocket.addEventListener('open', () => {
    if (debug)
      console.log('[NetworkClient] WebSocket connected');
    isConnected = true;
  });

  partySocket.addEventListener('close', () => {
    if (debug)
      console.log('[NetworkClient] WebSocket disconnected');
    isConnected = false;
  });

  partySocket.addEventListener('error', (error) => {
    console.error('[NetworkClient] WebSocket error:', error);
  });

  // Create oRPC client with Durable Iterator plugin

  const link = new RPCLink({
    url: `${httpUrl}/rpc`,
    plugins: [
      new DurableIteratorLinkPlugin({
        url: `${wsUrl}/game-room/${roomId}`,
        refreshTokenBeforeExpireInSeconds: 10 * 60, // 10 minutes
      }),
    ],
  });

  const client = createORPCClient<typeof gameContract>(link);

  // Helper to ensure connection
  async function ensureConnected(): Promise<void> {
    if (!isConnected) {
      throw new Error('WebSocket not connected');
    }
  }

  // Network client implementation
  return {
    // Connection status
    isConnected: () => isConnected,

    connect: async () => {
      if (isConnected)
        return;

      if (debug)
        console.log('[NetworkClient] Connecting...');

      // PartySocket handles connection automatically
      // Just wait for it to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        const onOpen = () => {
          clearTimeout(timeout);
          partySocket!.removeEventListener('open', onOpen);
          resolve();
        };

        if (isConnected) {
          clearTimeout(timeout);
          resolve();
        }
        else {
          partySocket!.addEventListener('open', onOpen);
        }
      });

      if (debug)
        console.log('[NetworkClient] Connected!');
    },

    disconnect: () => {
      if (partySocket) {
        partySocket.close();
        partySocket = null;
      }
      iterator = null;
      isConnected = false;
    },

    // State query
    getState: async (): Promise<BaseGameStateWire> => {
      await ensureConnected();
      return client.getState();
    },

    // Real-time subscription
    async* onStateUpdate(): AsyncIterableIterator<GameEventType> {
      await ensureConnected();

      if (!iterator) {
        iterator = await client.onStateUpdate();
      }

      for await (const event of iterator) {
        yield event;
      }
    },

    // Phase Management
    setPhase: async (input: { phase: string }) => {
      await ensureConnected();
      return client.setPhase(input);
    },

    // Player Management
    addPlayer: async (input: {
      id: string;
      name: string;
      avatar?: string;
      metadata?: any;
    }) => {
      await ensureConnected();
      return client.player.add(input);
    },

    removePlayer: async (input: { playerId: string }) => {
      await ensureConnected();
      return client.player.remove(input);
    },

    updatePlayer: async (input: { playerId: string; updates: any }) => {
      await ensureConnected();
      return client.player.update(input);
    },

    setPlayers: async (input: { players: any[] }) => {
      await ensureConnected();
      return client.player.setAll(input);
    },

    togglePlayerReady: async (input: { playerId: string }) => {
      await ensureConnected();
      return client.player.toggleReady(input);
    },

    // Settings
    updateSettings: async (input: { updates: any }) => {
      await ensureConnected();
      return client.settings.update(input);
    },

    // Turn Management
    nextTurn: async () => {
      await ensureConnected();
      return client.turn.next();
    },

    previousTurn: async () => {
      await ensureConnected();
      return client.turn.previous();
    },

    setCurrentPlayer: async (input: { playerId: string }) => {
      await ensureConnected();
      return client.turn.setCurrent(input);
    },

    nextRound: async () => {
      await ensureConnected();
      return client.turn.nextRound();
    },

    // Lifecycle
    canStartGame: async () => {
      await ensureConnected();
      return client.lifecycle.canStart();
    },

    startGame: async () => {
      await ensureConnected();
      return client.lifecycle.start();
    },

    endGame: async () => {
      await ensureConnected();
      return client.lifecycle.end();
    },

    resetGame: async () => {
      await ensureConnected();
      return client.lifecycle.reset();
    },

    // Direct client access for advanced use
    _client: client,
    _partySocket: partySocket,
  };
}

export type NetworkClient = ReturnType<typeof createNetworkClient>;
