import type { BaseAction, BaseGameState, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';
import {
  createGameEffectHandlers,
  createLocalAdapter,
  createNativeWSClient,
} from '@guess-logo/game-core';
import { createJSONStorage } from 'zustand/middleware';

export function createGameAdapter<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  definition: GameDefinition<TStateSchema, TActionSchema>,
  options: {
    mode: 'local' | 'multiplayer';
    roomId?: string;
    playerId?: string;
    credentials?: string;
    initialState: z.infer<TStateSchema>;
    persistenceKey?: string;
    partialize?: (state: { state: z.infer<TStateSchema> }) => Partial<{ state: z.infer<TStateSchema> }>;
  },
) {
  type State = z.infer<TStateSchema>;
  type Action = z.infer<TActionSchema>;

  const apiHost = import.meta.env.DEV ? 'localhost:8787' : window.location.host;
  const httpProtocol = window.location.protocol;
  const apiUrl = `${httpProtocol}//${apiHost}`;

  if (options.mode === 'local') {
    const effects = createGameEffectHandlers(definition.meta.id, apiUrl, 'local');

    return createLocalAdapter<State, Action>(
      options.initialState,
      definition.reducer as (state: State, action: Action) => State,
      {
        enabled: true,
        name: options.persistenceKey ?? 'game-core:local',
        storage: createJSONStorage(() => localStorage),
        partialize: options.partialize,
      },
      effects,
      apiUrl,
    );
  }

  if (options.mode === 'multiplayer' && options.roomId && options.playerId && options.credentials) {
    const wsProtocol = httpProtocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${apiHost}/api/game-room/${options.roomId}/ws?playerId=${encodeURIComponent(options.playerId)}&credentials=${encodeURIComponent(options.credentials)}`;

    return createNativeWSClient<TStateSchema, TActionSchema>({
      websocketUrl: wsUrl,
      stateSchema: definition.stateSchema,
      actionSchema: definition.actionSchema,
      initialState: options.initialState,
    });
  }

  throw new Error('Invalid adapter config: multiplayer mode requires roomId');
}
