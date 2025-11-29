import type { StoreApi } from 'zustand';
import type { GameAction } from '../../game-logic/schema/actions.types';
import type { BaseGameStateWire as GameState } from '../../game-logic/schema/state.types';
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
export function createLocalAdapter<TState extends GameState = GameState>(
  initialState: TState,
  reducer: (state: TState, action: GameAction) => TState = defaultReducer as any,
): GameAdapter<TState> {
  const store: StoreApi<GameStore<TState>> = create<GameStore<TState>>(set => ({
    state: initialState,

    dispatch: (action: GameAction) => {
      set(currentStore => ({
        ...currentStore,
        state: reducer(currentStore.state, action),
      }));
    },
  }));

  return {
    getState: () => store.getState().state,

    dispatch: async (action: GameAction) => {
      store.getState().dispatch(action);
    },

    subscribe: (listener: StateListener<TState>): Unsubscribe => {
      return store.subscribe(
        currentStore => listener(currentStore.state),
      );
    },
  };
}
