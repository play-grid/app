import type { StoreApi } from 'zustand';
import type { PersistOptions } from 'zustand/middleware';
import type { BaseAction } from '../../contracts/game-definition';
import type { GameEffect } from '../../contracts/game-effects';
import type { GameAction } from '../../game-logic/schema/actions.types';
import type { BaseGameState as GameState } from '../../game-logic/schema/state.types';
import type { GameAdapter, StateListener, Unsubscribe } from '../types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { gameReducer } from '../../game-logic/reducer';

export interface GameStore<TState = GameState, TAction = GameAction> {
  state: TState;
  dispatch: (action: TAction) => Promise<void>;
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
  effects: GameEffect[] = [],
  apiUrl: string = '',
): GameAdapter<TState, TAction> {
  const { enabled, name, storage, version, migrate } = persistOptions ?? {};

  const initializer = (set: any, get: any): GameStore<TState, TAction> => {
    const dispatchFn = async (action: TAction) => {
      set((current: GameStore<TState, TAction>) => ({
        ...current,
        state: reducer(current.state, action),
      }));

      for (const effect of effects) {
        const followUpAction = await effect({
          action: action as any,
          state: get().state,
          apiUrl,
          ctx: {},
          dispatch: dispatchFn as any,
        });

        if (followUpAction) {
          await dispatchFn(followUpAction as unknown as TAction);
        }
      }
    };

    return {
      state: initialState,
      dispatch: dispatchFn,
    };
  };

  let store: StoreApi<GameStore<TState, TAction>>;

  if (enabled) {
    store = create<GameStore<TState, TAction>>()(
      devtools(
        persist(initializer, {
          name: name ?? 'game-core:local',
          storage,
          version,
          migrate,
        } as PersistOptions<GameStore<TState, TAction>, any>),
        { name: name ?? 'game-core:local' },
      ),
    );
  }
  else {
    store = create<GameStore<TState, TAction>>()(
      devtools(initializer, { name: 'game-core:local' }),
    );
  }

  return {
    getState: () => store.getState().state,

    dispatch: async (action: TAction) => {
      await store.getState().dispatch(action);
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
