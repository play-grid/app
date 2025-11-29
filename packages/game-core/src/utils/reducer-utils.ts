import type { BaseGameStateWire } from '../game-logic/schema/state.types';

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
export function composeReducers<
  TState extends BaseGameStateWire,
  TAction = any,
>(
  gameReducer: (state: TState, action: TAction) => TState,
  coreReducer: (state: TState, action: TAction) => TState,
): (state: TState, action: TAction) => TState {
  return (state: TState, action: TAction): TState => {
    // Try game-specific reducer first
    const newState = gameReducer(state, action);

    // If game reducer handled it (state changed), return new state
    if (newState !== state) {
      return newState;
    }

    // Otherwise, let core reducer handle it
    return coreReducer(state, action);
  };
}
