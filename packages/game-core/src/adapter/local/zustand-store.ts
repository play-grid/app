import type { StoreApi } from 'zustand';
import type { GameAction as Action } from '../../game-logic/schema/actions.types';

import type { BaseGameStateWire as GameState } from '../../game-logic/schema/state.types';
import { create } from 'zustand';
import { gameReducer } from '../../game-logic/reducer';

/**
 * Defines the shape of the Zustand store for the game.
 * It holds the entire game state and a dispatch function to update it.
 */
export interface GameStore {
  state: GameState;
  dispatch: (action: Action) => void;
}

/**
 * Creates a Zustand store for local game management.
 * This store wraps the core `gameReducer`, making it available to React components
 * through a simple and reactive hook. It's designed for client-side use, such as
 * single-player or hot-seat modes.
 *
 * @param initialState The initial state of the game.
 * @returns A Zustand store instance adhering to the `GameStore` interface.
 */
export function createGameStore(initialState: GameState): StoreApi<GameStore> {
  return create<GameStore>(set => ({
    state: initialState,

    /**
     * The dispatch function that updates the state by running the reducer.
     */
    dispatch: (action) => {
      set(store => ({
        ...store,
        state: gameReducer(store.state, action),
      }));
    },
  }));
}
