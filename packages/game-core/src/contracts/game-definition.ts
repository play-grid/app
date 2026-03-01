import type { GameMeta } from '@playgrid/shared/schemas';
import type { z } from 'zod';
import type { GameAction } from '../game-logic/schema/actions.types';
import type { BaseGameState } from '../game-logic/schema/state.types';
import { GameMetaSchema } from '@playgrid/shared/schemas';

export { GameMetaSchema };
export type { GameMeta };

export type BaseAction = GameAction | Record<string, any>;

export interface ValidationContext {
  state: BaseGameState;
  action: BaseAction;
  playerId?: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export type ActionValidator = (
  context: ValidationContext,
) => ValidationResult;

export interface GameDefinition<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
> {
  meta: GameMeta;
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
  initialState: z.infer<TStateSchema>;
  reducer: (
    state: z.infer<TStateSchema>,
    action: z.infer<TActionSchema>,
  ) => z.infer<TStateSchema>;
  validator?: ActionValidator;
}
