// packages/game-core/src/contracts/game-definition.ts

import type { z } from 'zod';
import type { GameAction } from '../game-logic/schema/actions.types';
import type { BaseGameStateWire } from '../game-logic/schema/state.types';

export type BaseAction = GameAction | Record<string, any>;

export interface GameDefinition<
  TStateSchema extends z.ZodType<BaseGameStateWire>,
  TActionSchema extends z.ZodType<BaseAction>,
> {
  meta: {
    id: string;
    name: string;
    minPlayers: number;
    maxPlayers: number;
  };
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
  initialState: z.infer<TStateSchema>;
  reducer: (
    state: z.infer<TStateSchema>,
    action: z.infer<TActionSchema>,
  ) => z.infer<TStateSchema>;
}
