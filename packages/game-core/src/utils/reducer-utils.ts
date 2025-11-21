import type { z } from 'zod';
import type { BaseAction, GameDefinition } from '../contracts/game-definition';
import type { GameAction } from '../game-logic/schema/actions.types';
import type { BaseGameStateWire } from '../game-logic/schema/state.types';

/**
 * Creates a composed reducer that prioritizes the game-specific reducer
 * and falls back to the core game reducer.
 * @param gameDefinition The definition of the game, containing the game-specific reducer.
 * @param coreReducer The core reducer that handles common game actions.
 * @returns A new reducer function that combines both reducers.
 */
export function createComposedReducer<
  TGameStateSchema extends z.ZodType<BaseGameStateWire>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  gameDefinition: GameDefinition<TGameStateSchema, TActionSchema>,
  coreReducer: (
    state: z.infer<TGameStateSchema>,
    action: GameAction,
  ) => z.infer<TGameStateSchema>,
) {
  /**
   * The composed reducer function.
   * @param state The current game state.
   * @param action The action to be processed.
   * @returns The new game state.
   */
  return function composedReducer(
    state: z.infer<TGameStateSchema>,
    action: z.infer<TActionSchema>,
  ): z.infer<TGameStateSchema> {
    const gameSpecificState = gameDefinition.reducer(state, action);
    if (gameSpecificState !== state) {
      return gameSpecificState;
    }

    return coreReducer(state, action as GameAction);
  };
}
