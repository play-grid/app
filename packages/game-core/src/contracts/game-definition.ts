import type { GameAction } from '../game-logic/schema/actions.types';
import type { BaseGameState } from '../game-logic/schema/state.types';
import { z } from 'zod';

export const GameMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  minPlayers: z.number().int().min(1),
  maxPlayers: z.number().int().min(1),
  imageUrl: z.url().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

export type GameMeta = z.infer<typeof GameMetaSchema>;

export type BaseAction = GameAction | Record<string, any>;

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
}
