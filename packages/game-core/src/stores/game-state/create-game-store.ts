import type { GameStore, GameStoreOptions, Player } from '../../types/core';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createBaseStore } from './base-store';

export interface CreateGameStoreConfig<
  TSettings,
  _TPlayer extends Player,
  TCustom extends object = Record<string, never>,
> {
  name: string;
  initialSettings: TSettings;
  options?: GameStoreOptions;
  persist?: boolean;
  devtools?: boolean;
  customState?: Partial<TCustom>;
  customActions?: (set: any, get: any) => Record<string, any>;
}

/**
 * @deprecated
 */
export function createGameStore<
  TSettings,
  TPlayer extends Player = Player,
  TCustom extends object = Record<string, never>,
>(config: CreateGameStoreConfig<TSettings, TPlayer, TCustom>) {
  const {
    name,
    initialSettings,
    options,
    persist: shouldPersist = true,
    devtools: shouldDevtools = true,
    customState = {},
    customActions,
  } = config;

  const storeCreator = (set: any, get: any): GameStore<TSettings, TPlayer> & TCustom & Record<string, any> => ({
    ...createBaseStore<TSettings, TPlayer, TCustom>(initialSettings, options, customState)(set, get),
    ...({ ...customState, ...(customActions ? customActions(set, get) : {}) } as TCustom),
  });

  // Apply middleware
  let store: any = storeCreator;

  if (shouldPersist) {
    store = persist(store, {
      name: `game-${name}`,
      partialize: (state: any) => ({
        phase: state.phase,
        players: state.players,
        hostId: state.hostId,
        settings: state.settings,
        turnState: state.turnState,
        ...Object.keys(customState).reduce(
          (acc, key) => {
            acc[key] = state[key];
            return acc;
          },
          {} as Record<string, any>,
        ),
      }),
    }) as any;
  }

  if (shouldDevtools) {
    store = devtools(store, { name: `${name}Store` }) as any;
  }

  return create<GameStore<TSettings, TPlayer> & TCustom & Record<string, any>>()(store);
}
