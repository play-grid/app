import type { BaseAction, BaseGameStateWire, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';
import {
  composeReducers,
  createLocalAdapter,
  gameReducer,
} from '@guess-logo/game-core';
import { createMultiplayerAdapter } from '@guess-logo/game-core/adapter/multiplayer';

export function createGameAdapter<
  TStateSchema extends z.ZodType<BaseGameStateWire>,
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
    const composedReducer = composeReducers<State, Action>(
      definition.reducer,
      gameReducer,
    );

    return createLocalAdapter<State, Action>(
      options.initialState as State,
      composedReducer,
    );
  }

  if (options.mode === 'multiplayer' && options.roomId) {
    const apiHost = import.meta.env.DEV ? 'localhost:8787' : window.location.host;
    return createMultiplayerAdapter({
      wsUrl: apiHost,
      room: `game-room:${options.roomId}`,
      token: undefined,
      stateSchema: definition.stateSchema,
      actionSchema: definition.actionSchema,
      initialState: options.initialState,
    });
  }

  throw new Error('Invalid adapter config: multiplayer mode requires roomId');
}
