import type { BaseAction, BaseGameState, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';
import {
  createLocalAdapter,
  createNativeWSClient,
} from '@guess-logo/game-core';

export function createGameAdapter<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  definition: GameDefinition<TStateSchema, TActionSchema>,
  options: {
    mode: 'local' | 'multiplayer';
    roomId?: string;
    initialState: z.infer<TStateSchema>;
  },
) {
  type State = z.infer<TStateSchema>;
  type Action = z.infer<TActionSchema>;

  if (options.mode === 'local') {
    return createLocalAdapter<State, Action>(
      options.initialState as State,
      definition.reducer,
    );
  }

  if (options.mode === 'multiplayer' && options.roomId) {
    const apiHost = import.meta.env.DEV ? 'localhost:8787' : window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${apiHost}/api/game-room/${options.roomId}/ws`;

    return createNativeWSClient<TStateSchema, TActionSchema>({
      websocketUrl: wsUrl,
      stateSchema: definition.stateSchema,
      actionSchema: definition.actionSchema,
      initialState: options.initialState,
    });
  }

  throw new Error('Invalid adapter config: multiplayer mode requires roomId');
}
