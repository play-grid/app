import type { z } from 'zod';
import type { GameAdapter, StateListener, Unsubscribe } from '../../types';
import { logger } from '../../../utils/logger';

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
    this.currentState = config.initialState;
    this.websocket = new WebSocket(config.websocketUrl);

    this.websocket.addEventListener('open', () => {
      logger.info('[NativeWSClient] Connected');
      this.send('syncState', {});
    });

    this.websocket.addEventListener('message', (event: MessageEvent) => {
      this.handleMessage(event.data);
    });

    this.websocket.addEventListener('close', (event: CloseEvent) => {
      logger.info({ code: event.code, reason: event.reason }, '[NativeWSClient] Disconnected:');
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
          logger.error(message.payload.error, '[NativeWSClient] Action failed:');
        }
      }
    }
    catch (err) {
      logger.error(err, '[NativeWSClient] Failed to parse message:');
    }
  };

  private send = (type: string, payload: any) => {
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type, payload }));
    }
    else {
      logger.warn({ type }, '[NativeWSClient] Socket not open, cannot send');
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
      logger.error(error, '[NativeWSClient] Client-side action validation failed:');
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
        logger.error(error, '[NativeWSClient] Listener error:');
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
