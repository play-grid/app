import type { z } from 'zod';
import type { BaseAction, GameDefinition, GameMeta } from './contracts/game-definition';
import { gameReducer } from './game-logic/reducer';
import { composeReducers } from './utils/reducer-utils';

export function createGameDefinition<
  TStateSchema extends z.ZodType<any>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  config: {
    meta: GameMeta;
    stateSchema: TStateSchema;
    actionSchema: TActionSchema;
    initialState: z.infer<TStateSchema>;
    customReducer: (state: z.infer<TStateSchema>, action: z.infer<TActionSchema>) => z.infer<TStateSchema>;
  },
): GameDefinition<TStateSchema, TActionSchema> {
  const composedReducer = composeReducers(config.customReducer, gameReducer);

  return {
    meta: config.meta,
    stateSchema: config.stateSchema,
    actionSchema: config.actionSchema,
    initialState: config.initialState,
    reducer: composedReducer,
  };
}
