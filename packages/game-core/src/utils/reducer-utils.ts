import type { GameAction } from '../game-logic/schema/actions.types';
import type { BaseGameState } from '../game-logic/schema/state.types';

/**
 * Composes multiple reducers into a single reducer.
 *
 * Execution order:
 * 1. Game-specific reducer runs first
 * 2. If it returns the same state (didn't handle action), core reducer runs
 *
 * This allows games to:
 * - Handle custom actions (ADD_SEEN_QUESTION_ID, START_VOTING)
 * - Override core behavior (customize ADD_PLAYER logic)
 * - Delegate to core for generic actions (NEXT_TURN, END_GAME)
 *
 * @param gameReducer - Game-specific reducer
 * @param coreReducer - Core reducer (handles base actions)
 * @returns Composed reducer function
 */

export function composeReducers<TState extends BaseGameState, TAction>(
  gameSpecificReducer: (state: TState, action: TAction) => TState,
  coreReducer: (state: TState, action: GameAction) => TState,
): (state: TState, action: TAction) => TState {
  return (state: TState, action: TAction): TState => {
    const stateAfterGameSpecific = gameSpecificReducer(state, action);

    return coreReducer(
      stateAfterGameSpecific,
      action as unknown as GameAction,
    );
  };
}
