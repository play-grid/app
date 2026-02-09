import type { BaseAction, BaseGameState, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';
import {
  createGameEffectHandlers,
  createLocalAdapter,
  createNativeWSClient,
} from '@guess-logo/game-core';
import { createJSONStorage } from 'zustand/middleware';

function getApiBase(): string {
  if (import.meta.env.DEV) {
    return 'http://localhost:8787';
  }
  return '';
}

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

  const apiBase = getApiBase();

  if (options.mode === 'local') {
    const effects = createGameEffectHandlers(definition.meta.id, apiBase, 'local');

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
      apiBase,
    );
  }

  if (options.mode === 'multiplayer' && options.roomId && options.playerId && options.credentials) {
    const wsProtocol = import.meta.env.DEV ? 'ws' : 'wss';
    const wsPath = `/api/game-room/${options.roomId}/ws?playerId=${encodeURIComponent(
      options.playerId,
    )}&credentials=${encodeURIComponent(options.credentials)}`;

    const wsUrl = apiBase
      ? `${wsProtocol}://${new URL(apiBase).host}${wsPath}`
      : wsPath.startsWith('/') ? wsPath : `/${wsPath}`;

    return createNativeWSClient<TStateSchema, TActionSchema>({
      websocketUrl: wsUrl,
      stateSchema: definition.stateSchema,
      actionSchema: definition.actionSchema,
      initialState: options.initialState,
    });
  }

  throw new Error('Invalid adapter config: multiplayer mode requires roomId, playerId, credentials');
}
