/* eslint-disable no-console */
import type { z } from 'zod';
import type { GameAdapter, StateListener, Unsubscribe } from '../../types';

export interface NativeWSClientAdapterConfig<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> {
  websocketUrl: string;
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
  initialState: z.infer<TStateSchema>;
}

export class NativeWSClient<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> implements GameAdapter<z.infer<TStateSchema>, z.infer<TActionSchema>> {
  private currentState: z.infer<TStateSchema>;
  private listeners = new Set<StateListener<z.infer<TStateSchema>>>();
  private websocket: WebSocket;
  private config: NativeWSClientAdapterConfig<TStateSchema, TActionSchema>;

  constructor(config: NativeWSClientAdapterConfig<TStateSchema, TActionSchema>) {
    this.config = config;
    console.log(`[NativeWSClient] Constructor called for URL: ${config.websocketUrl}`); // ADD THIS LINE
    this.currentState = config.initialState;
    console.log('[NativeWSClient] Connecting to:', config.websocketUrl);
    this.websocket = new WebSocket(config.websocketUrl);

    this.websocket.addEventListener('open', () => {
      console.log('[NativeWSClient] Connected');
      this.send('syncState', {});
    });

    this.websocket.addEventListener('message', (event: MessageEvent) => {
      this.handleMessage(event.data);
    });

    this.websocket.addEventListener('close', (event: CloseEvent) => {
      console.log('[NativeWSClient] Disconnected:', event.code, event.reason);
    });
  }

  private handleMessage = (data: any) => {
    try {
      const message = JSON.parse(typeof data === 'string' ? data : data.toString());

      if (message.type === 'onStateUpdate') {
        const parsedState = this.config.stateSchema.parse(message.payload);
        this.updateState(parsedState);
      }

      if (message.type === 'dispatchAction_result') {
        if (!message.payload.success) {
          console.error('[NativeWSClient] Action failed:', message.payload.error);
        }
      }
    }
    catch (err) {
      console.error('[NativeWSClient] Failed to parse message:', err);
    }
  };

  private send = (type: string, payload: any) => {
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type, payload }));
    }
    else {
      console.warn('[NativeWSClient] Socket not open, cannot send', type);
    }
  };

  getState = (): z.infer<TStateSchema> => {
    return this.currentState;
  };

  dispatch = async (action: z.infer<TActionSchema>): Promise<void> => {
    // Optional: client-side validation before sending, for faster feedback
    try {
      this.config.actionSchema.parse(action);
    }
    catch (error) {
      console.error('[NativeWSClient] Client-side action validation failed:', error);
      return; // Don't send invalid action
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.send('dispatchAction', {
      action,
      requestId,
    });
  };

  subscribe = (listener: StateListener<z.infer<TStateSchema>>): Unsubscribe => {
    this.listeners.add(listener);

    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  };

  disconnect = (): void => {
    this.websocket.close();
    this.listeners.clear();
  };

  private updateState = (newState: z.infer<TStateSchema>): void => {
    this.currentState = newState;
    this.notifyListeners();
  };

  private notifyListeners = (): void => {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      }
      catch (error) {
        console.error('[NativeWSClient] Listener error:', error);
      }
    });
  };
}

export function createNativeWSClient<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
>(
  config: NativeWSClientAdapterConfig<TStateSchema, TActionSchema>,
): NativeWSClient<TStateSchema, TActionSchema> {
  return new NativeWSClient(config);
}
