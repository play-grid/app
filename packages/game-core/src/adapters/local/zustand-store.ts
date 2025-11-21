import type { StoreApi } from 'zustand';
import type { GameAction } from '../../game-logic/schema/actions.types';
import type { BaseGameStateWire as GameState } from '../../game-logic/schema/state.types';
import type { GameAdapter, StateListener, Unsubscribe } from '../types';
import { create } from 'zustand';
import { gameReducer } from '../../game-logic/reducer';

/**
 * Internal Zustand store structure.
 * Holds state and dispatch method.
 */
interface GameStore {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

/**
 * Creates a local game adapter using Zustand for state management.
 *
 * This adapter is **client-authoritative** - the reducer runs directly
 * on the client without any server validation. Perfect for:
 * - Single-player games
 * - Hotseat multiplayer (pass-and-play)
 * - Offline games
 * - Development/testing
 *
 * @param initialState - The starting state of the game
 * @returns A GameAdapter instance
 *
 * @example
 * ```typescript
 * const adapter = createLocalAdapter({
 *   phase: 'lobby',
 *   players: {},
 *   hostId: '',
 *   settings: {},
 *   createdAt: Date.now()
 * });
 *
 * // Use with React
 * <AdapterProvider adapter={adapter}>
 *   <GameBoard />
 * </AdapterProvider>
 * ```
 */
export function createLocalAdapter(initialState: GameState): GameAdapter<GameState> {
  // Create internal Zustand store
  const store: StoreApi<GameStore> = create<GameStore>(set => ({
    state: initialState,

    dispatch: (action: GameAction) => {
      set(currentStore => ({
        ...currentStore,
        state: gameReducer(currentStore.state, action),
      }));
    },
  }));

  // Implement GameAdapter interface
  return {
    getState: () => store.getState().state,

    dispatch: async (action: GameAction) => {
      // Execute synchronously but return Promise for consistency
      store.getState().dispatch(action);
    },

    subscribe: (listener: StateListener<GameState>): Unsubscribe => {
      // Zustand's subscribe gives us (state, prevState) but we only need state
      return store.subscribe(
        currentStore => listener(currentStore.state),
      );
    },
  };
}
