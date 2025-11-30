// TODO : use logger like pino
/* eslint-disable no-console */
import type { z } from 'zod';
import type { GameAction } from '../../../game-logic/schema/actions.types';
import type { BaseGameStateWire } from '../../../game-logic/schema/state.types';
import type { GameAdapter, StateListener, Unsubscribe } from '../../types';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/websocket';
import PartySocket from 'partysocket';

export interface MultiplayerAdapterConfig<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> {
  wsUrl: string;
  room: string;
  token?: string;
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
  initialState: BaseGameStateWire;
}

/**
 * Multiplayer adapter using oRPC + Hibernation.
 * Leverages oRPC's type-safe RPC and Hibernation's efficient streaming.
 */
export class MultiplayerAdapter<
  TState extends BaseGameStateWire = BaseGameStateWire,
  TAction extends GameAction = GameAction,
> implements GameAdapter<TState, TAction> {
  private currentState: TState;
  private listeners = new Set<StateListener<TState>>();
  private websocket: PartySocket;
  private client: any; // TODO: Can be typed with server router type for full IDE support
  private stateStreamController: AbortController | null = null;

  constructor(config: MultiplayerAdapterConfig<any, any>) {
    this.currentState = config.initialState as TState;

    // Create PartySocket with correct API
    this.websocket = new PartySocket({
      host: config.wsUrl,
      room: config.room,
      query: config.token
        ? {
            token: config.token,
          }
        : undefined,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
    });

    // Create oRPC client with WebSocket link
    const link = new RPCLink({
      websocket: this.websocket,
    });

    this.client = createORPCClient(link);

    // Setup connection handlers
    this.websocket.addEventListener('open', () => {
      console.log('[MultiplayerAdapter] Connected');
      this.subscribeToStateUpdates();
    });

    this.websocket.addEventListener('close', () => {
      console.log('[MultiplayerAdapter] Disconnected');
      this.unsubscribeFromStateUpdates();
    });

    this.websocket.addEventListener('error', (error) => {
      console.error('[MultiplayerAdapter] WebSocket error:', error);
    });
  }

  getState(): TState {
    return this.currentState;
  }

  async dispatch(action: TAction): Promise<void> {
    try {
      const result = await this.client.dispatchAction({
        action,
        requestId: `req_${Date.now()}`,
      });

      if (!result.success) {
        throw new Error(result.error ?? 'Action failed');
      }
    }
    catch (error) {
      console.error('[MultiplayerAdapter] Dispatch failed:', error);
      throw error;
    }
  }

  subscribe(listener: StateListener<TState>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  disconnect(): void {
    this.unsubscribeFromStateUpdates();
    this.websocket.close();
  }

  private subscribeToStateUpdates(): void {
    this.unsubscribeFromStateUpdates();
    this.stateStreamController = new AbortController();

    void (async () => {
      try {
        const stateIterator = await this.client.onStateUpdate(undefined, {
          signal: this.stateStreamController!.signal,
        });

        for await (const state of stateIterator) {
          this.updateState(state as TState);
        }
      }
      catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('[MultiplayerAdapter] State stream cancelled');
        }
        else {
          console.error('[MultiplayerAdapter] State stream error:', error);
        }
      }
    })();
  }

  private unsubscribeFromStateUpdates(): void {
    if (this.stateStreamController) {
      this.stateStreamController.abort();
      this.stateStreamController = null;
    }
  }

  private updateState(newState: TState): void {
    this.currentState = newState;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      }
      catch (error) {
        console.error('[MultiplayerAdapter] Listener error:', error);
      }
    });
  }
}

/**
 * Factory function to create multiplayer adapter
 */
export function createMultiplayerAdapter<
  TState extends BaseGameStateWire,
  TAction extends GameAction,
>(
  config: MultiplayerAdapterConfig<any, any>,
): MultiplayerAdapter<TState, TAction> {
  return new MultiplayerAdapter<TState, TAction>(config);
}
