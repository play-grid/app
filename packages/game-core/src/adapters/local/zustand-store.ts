import type { StoreApi } from 'zustand';
import type { PersistOptions } from 'zustand/middleware';
import type { BaseAction } from '../../contracts/game-definition';
import type { GameAction } from '../../game-logic/schema/actions.types';
import type { BaseGameState as GameState } from '../../game-logic/schema/state.types';
import type { GameAdapter, StateListener, Unsubscribe } from '../types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gameReducer } from '../../game-logic/reducer';

export interface GameStore<TState = GameState, TAction = GameAction> {
  state: TState;
  dispatch: (action: TAction) => void;
}

export interface LocalAdapterPersistOptions<TState, TAction = GameAction> {
  enabled?: boolean;
  name?: string;
  storage?: any;
  version?: number;
  migrate?: (
    persistedState: unknown,
    version: number,
  ) => Promise<GameStore<TState, TAction>> | GameStore<TState, TAction>;
}

export function createLocalAdapter<
  TState extends GameState = GameState,
  TAction extends BaseAction = GameAction,
>(
  initialState: TState,
  reducer: (state: TState, action: TAction) => TState = gameReducer as any,
  persistOptions?: LocalAdapterPersistOptions<TState, TAction>,
): GameAdapter<TState, TAction> {
  const { enabled, name, storage, version, migrate } = persistOptions ?? {};

  const initializer = (set: any): GameStore<TState, TAction> => ({
    state: initialState,
    dispatch: (action: TAction) => {
      set((current: GameStore<TState, TAction>) => ({
        ...current,
        state: reducer(current.state, action),
      }));
    },
  });

  let store: StoreApi<GameStore<TState, TAction>>;

  if (enabled) {
    const persistConfig: PersistOptions<GameStore<TState, TAction>> = {
      name: name ?? 'game-core:local',
      storage,
      version,
      migrate,
    };

    store = create<GameStore<TState, TAction>>()(
      persist(initializer, persistConfig as any),
    );
  }
  else {
    store = create<GameStore<TState, TAction>>(initializer);
  }

  return {
    getState: () => store.getState().state,
    dispatch: async (action: TAction) => {
      store.getState().dispatch(action);
    },
    subscribe: (listener: StateListener<TState>): Unsubscribe => {
      let prev = store.getState().state;
      return store.subscribe((curr) => {
        const next = curr.state;
        if (next !== prev) {
          prev = next;
          listener(next);
        }
      });
    },
  };
}
