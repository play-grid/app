import type { BaseGameStateWire } from '../game-logic/schema/state.types';
import { z } from 'zod';

/**
 * Defines the most basic shape of a game action.
 */
export const BaseActionSchema = z.object({
  type: z.string(),
  payload: z.any().optional(),
});

export type BaseAction = z.infer<typeof BaseActionSchema>;

/**
 * Defines the metadata for a game.
 */
export const GameMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  minPlayers: z.number(),
  maxPlayers: z.number(),
});

export type GameMeta = z.infer<typeof GameMetaSchema>;

/**
 * Defines the contract that every game package must implement.
 * This ensures that games are self-contained and can be loaded dynamically.
 *
 * @template TGameState The Zod schema for the game's state, extending BaseGameState.
 * @template TAction The Zod schema for the game's actions, extending BaseAction.
 */
export interface GameDefinition<
  TGameState extends z.ZodType<BaseGameStateWire> = z.ZodType<BaseGameStateWire>,
  TAction extends z.ZodType<BaseAction> = z.ZodType<BaseAction>,
> {
  /**
   * Static metadata about the game.
   */
  meta: GameMeta;

  /**
   * The Zod schema for validating the game's state.
   */
  stateSchema: TGameState;

  /**
   * The Zod schema for validating game actions.
   */
  actionSchema: TAction;

  /**
   * The initial state of the game. This will be parsed by the stateSchema
   * to ensure it's valid and to apply default values.
   */
  initialState: Partial<z.infer<TGameState>>;

  /**
   * The pure reducer function that handles all state transitions for the game.
   *
   * @param state The current state.
   * @param action The action to apply.
   * @returns The new state.
   */
  reducer: (
    state: z.infer<TGameState>,
    action: z.infer<TAction>,
  ) => z.infer<TGameState>;
}
