/* eslint-disable no-console */
import type { ContractRouterClient } from '@orpc/contract';
import type { z } from 'zod';
import type { GameAdapter, StateListener, Unsubscribe } from '../../types';
import type { GameContract } from '../contracts';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/websocket';
import { WebSocket } from 'partysocket';

export interface MultiplayerAdapterConfig<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> {
  wsUrl: string;
  room: string;
  token?: string;
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
  initialState: z.infer<TStateSchema>;
}

export class MultiplayerAdapter<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> implements GameAdapter<z.infer<TStateSchema>, z.infer<TActionSchema>> {
  private currentState: z.infer<TStateSchema>;
  private listeners = new Set<StateListener<z.infer<TStateSchema>>>();
  private websocket: WebSocket;
  private client: ContractRouterClient<GameContract<TStateSchema, TActionSchema>>;
  private stateStreamController: AbortController | null = null;

  constructor(config: MultiplayerAdapterConfig<TStateSchema, TActionSchema>) {
    this.currentState = config.initialState;

    this.websocket = new WebSocket(
      async () => {
        const roomId = config.room;
        const token = config.token ? `?token=${config.token}` : '';
        return `ws://${config.wsUrl}/api/game-room/${roomId}/ws${token}`;
      },
      [], // no custom protocols
      {
        debug: true,
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
      },
    );

    const link = new RPCLink({
      websocket: this.websocket,
    });

    this.client = createORPCClient(link);

    this.websocket.addEventListener('open', () => {
      console.log('[MultiplayerAdapter] Connected');
      this.subscribeToStateUpdates();
    });

    this.websocket.addEventListener('close', (event) => {
      console.log('[MultiplayerAdapter] Disconnected:', event.code, event.reason);
      this.unsubscribeFromStateUpdates();

      if (event.code === 1008) {
        console.error('[MultiplayerAdapter] Room session invalid');
      }
    });

    this.websocket.addEventListener('error', (error) => {
      console.error('[MultiplayerAdapter] WebSocket error:', error);
    });
  }

  getState(): z.infer<TStateSchema> {
    return this.currentState;
  }

  async dispatch(action: z.infer<TActionSchema>): Promise<void> {
    try {
      const payload: { action: z.infer<TActionSchema>; requestId?: string } = {
        action,
      };

      payload.requestId = `req_${Date.now()}`;

      const result = await this.client.dispatchAction({
        ...payload,
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

  subscribe(listener: StateListener<z.infer<TStateSchema>>): Unsubscribe {
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
        const stateIterator = (await this.client.onStateUpdate()) as AsyncIterable<
          z.infer<TStateSchema>
        >;

        for await (const state of stateIterator) {
          if (this.stateStreamController?.signal.aborted) {
            console.log('[MultiplayerAdapter] State stream cancelled');
            break;
          }
          this.updateState(state);
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

  private updateState(newState: z.infer<TStateSchema>): void {
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

export function createMultiplayerAdapter<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
>(
  config: MultiplayerAdapterConfig<TStateSchema, TActionSchema>,
): MultiplayerAdapter<TStateSchema, TActionSchema> {
  return new MultiplayerAdapter(config);
}
