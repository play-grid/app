// packages/game-core/src/adapters/local/zustand-store.ts

import type { StoreApi } from 'zustand';
import type { GameAction } from '../../game-logic/schema/actions.types';
import type { BaseGameState as GameState } from '../../game-logic/schema/state.types';
import type { GameAdapter, StateListener, Unsubscribe } from '../types';
import { create } from 'zustand';
import { gameReducer as defaultReducer } from '../../game-logic/reducer';

export interface GameStore<TState = GameState> {
  state: TState;
  dispatch: (action: GameAction) => void;
}

/**
 * Creates a local game adapter using Zustand for state management.
 *
 * @param initialState - The starting state of the game
 * @param reducer - Optional custom reducer (defaults to core gameReducer)
 * @returns A GameAdapter instance
 */
export function createLocalAdapter<
  TState extends GameState = GameState,
  TAction = GameAction,
>(
  initialState: TState,
  reducer: (state: TState, action: TAction) => TState = defaultReducer as unknown as (
    state: TState,
    action: TAction,
  ) => TState,
): GameAdapter<TState, TAction> {
  const store: StoreApi<GameStore<TState>> = create<GameStore<TState>>(set => ({
    state: initialState,

    dispatch: (action: GameAction) => {
      set(currentStore => ({
        ...currentStore,
        state: reducer(currentStore.state, action as TAction),
      }));
    },
  }));

  return {
    getState: () => store.getState().state,

    dispatch: async (action: TAction) => {
      store.getState().dispatch(action as GameAction);
    },

    subscribe: (listener: StateListener<TState>): Unsubscribe => {
      return store.subscribe(
        currentStore => listener(currentStore.state),
      );
    },
  };
}
