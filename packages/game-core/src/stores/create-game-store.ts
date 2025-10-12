import type { GameStore, GameStoreOptions, Player } from '../types/core';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createBaseStore } from './base-store';

export interface CreateGameStoreConfig<TSettings, _TPlayer extends Player> {
  name: string;
  initialSettings: TSettings;
  options?: GameStoreOptions;
  persist?: boolean;
  devtools?: boolean;
}

export function createGameStore<TSettings, TPlayer extends Player = Player>(
  config: CreateGameStoreConfig<TSettings, TPlayer>,
) {
  const { name, initialSettings, options, persist: shouldPersist = true, devtools: shouldDevtools = true } = config;

  const storeCreator = (set: any, get: any): GameStore<TSettings, TPlayer> => ({
    ...createBaseStore<TSettings, TPlayer>(initialSettings, options)(set, get),
  });

  // Apply middleware
  let store = immer(storeCreator);

  if (shouldPersist) {
    store = persist(store, {
      name: `game-${name}`,
      partialize: (state: any) => ({
        phase: state.phase,
        players: state.players,
        hostId: state.hostId,
        settings: state.settings,
        turnState: state.turnState,
      }),
    }) as any;
  }

  if (shouldDevtools) {
    store = devtools(store, { name: `${name}Store` }) as any;
  }

  return create<GameStore<TSettings, TPlayer>>()(store);
}
