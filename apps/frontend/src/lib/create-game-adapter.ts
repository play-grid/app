import type { BaseAction, BaseGameState, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';
import {
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
  },
) {
  type State = z.infer<TStateSchema>;
  type Action = z.infer<TActionSchema>;

  if (options.mode === 'local') {
    return createLocalAdapter<State, Action>(
      options.initialState,
      definition.reducer as (state: State, action: Action) => State,
      {
        enabled: true,
        name: options.persistenceKey ?? 'game-core:local',
        storage: createJSONStorage(() => localStorage),
      },
    );
  }

  if (options.mode === 'multiplayer' && options.roomId && options.playerId && options.credentials) {
    const apiHost = import.meta.env.DEV ? 'localhost:8787' : window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${apiHost}/api/game-room/${options.roomId}/ws?playerId=${encodeURIComponent(options.playerId)}&credentials=${encodeURIComponent(options.credentials)}`;

    return createNativeWSClient<TStateSchema, TActionSchema>({
      websocketUrl: wsUrl,
      stateSchema: definition.stateSchema,
      actionSchema: definition.actionSchema,
      initialState: options.initialState,
    });
  }

  throw new Error('Invalid adapter config: multiplayer mode requires roomId');
}
