// games/guess-logo/stores/game-store.ts
import type { GameStore } from '@guess-logo/game-core/types';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { GuessLogoPlayer, GuessLogoSettings } from '../types/game';
import { createGameStore } from '@guess-logo/game-core/stores';
import { create } from 'zustand';

import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fetchLogoLists } from '../services/logo-lists-service';
import { fetchLogos } from '../services/logo-query-service';

// ============ Extended Store Type ============
export interface GuessLogoStoreState extends GameStore<GuessLogoSettings, GuessLogoPlayer> {
  // Game-specific loading states
  isUpdatingList: boolean;
  isUpdatingLogos: boolean;
}

export interface GuessLogoStoreActions {
  // Game-specific actions
  updateSelectedSet: (set: string) => Promise<void>;
  updateLogosForList: (
    listId: string,
    logoSet: string,
    language: SupportedLanguage,
    count: number,
  ) => Promise<void>;
  shuffleLogos: (language: SupportedLanguage) => Promise<void>;
  togglePlayerLogo: (playerId: string, logoId: number) => void;
  setIsUpdatingList: (updating: boolean) => void;
  setIsUpdatingLogos: (updating: boolean) => void;
}

export type GuessLogoStore = GuessLogoStoreState & GuessLogoStoreActions;

// ============ Initial Settings ============
const initialSettings: GuessLogoSettings = {
  selectedSet: 'companies',
  selectedList: 'companies',
  selectedGrid: '8x6',
  gridCols: 4,
};

// ============ Create Extended Store ============
export const useGuessLogoStore = create<GuessLogoStore>()(
  devtools(
    persist(
      immer((set, get) => {
        // Get base store
        const baseStore = createGameStore<GuessLogoSettings, GuessLogoPlayer>({
          name: 'guess-logo-base',
          initialSettings,
          options: {
            maxPlayers: 2,
            minPlayers: 2,
            turnBased: true,
            requireReady: false,
          },
          persist: false, // We'll handle persistence in the outer store
          devtools: false, // We'll handle devtools in the outer store
        });

        const baseStoreState = baseStore.getState();

        return {
          // ============ Spread Base Store ============
          ...baseStoreState,

          // ============ Game-Specific State ============
          isUpdatingList: false,
          isUpdatingLogos: false,

          // ============ Game-Specific Actions ============
          setIsUpdatingList: (updating: boolean) => {
            set({ isUpdatingList: updating });
          },

          setIsUpdatingLogos: (updating: boolean) => {
            set({ isUpdatingLogos: updating });
          },

          updateSelectedSet: async (selectedSet: string) => {
            set({ isUpdatingList: true });
            try {
              const lists = await fetchLogoLists(selectedSet as any);
              const defaultList = lists[0]?.id || '';
              get().updateSettings({
                selectedSet: selectedSet as any,
                selectedList: defaultList,
              });
            }
            catch (error) {
              console.error('Failed to update selected set', error);
            }
            finally {
              set({ isUpdatingList: false });
            }
          },

          updateLogosForList: async (
            listId: string,
            logoSet: string,
            language: SupportedLanguage,
            count: number,
          ) => {
            const { settings, players, phase } = get();

            if (phase === 'playing' && settings.selectedList === listId && settings.selectedSet === logoSet) {
              return;
            }

            set({ isUpdatingLogos: true });
            try {
              const fetchedLogos = await fetchLogos(logoSet as any, listId, language, count);

              const logos = fetchedLogos.map(logo => ({
                id: logo.id,
                name: logo.name,
                originalName: logo.originalName,
                imageUrl: logo.imageUrl,
                eliminated: false,
                countryData: logo.countryData,
              }));

              const stats = getPlayerStats(logos);
              const updatedPlayers = players.map(p => ({
                ...p,
                logos: [...logos],
                ...stats,
              }));

              get().setPlayers(updatedPlayers as GuessLogoPlayer[]);
              get().updateSettings({ selectedList: listId });
              get().startGame();
            }
            catch (error) {
              console.error('Failed to update logos for list', error);
            }
            finally {
              set({ isUpdatingLogos: false });
            }
          },

          shuffleLogos: async (language: SupportedLanguage) => {
            const { settings, players, phase } = get();

            if (phase !== 'playing' || players.length === 0) {
              return;
            }

            try {
              const fetchedLogos = await fetchLogos(
                settings.selectedSet,
                settings.selectedList,
                language,
                players[0].logos.length,
                true,
              );

              const newLogos = fetchedLogos.map(logo => ({
                id: logo.id,
                name: logo.name,
                originalName: logo.originalName,
                imageUrl: logo.imageUrl,
                eliminated: false,
                countryData: logo.countryData,
              }));

              const stats = getPlayerStats(newLogos);
              const updatedPlayers = players.map(p => ({
                ...p,
                logos: [...newLogos],
                ...stats,
              }));

              get().setPlayers(updatedPlayers as GuessLogoPlayer[]);
            }
            catch (error) {
              console.error('Failed to shuffle logos', error);
            }
          },

          togglePlayerLogo: (playerId: string, logoId: number) => {
            const player = get().players.find(p => p.id === playerId);
            if (!player)
              return;

            const newLogos = player.logos.map(logo =>
              logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
            );

            const stats = getPlayerStats(newLogos);

            get().updatePlayer(playerId, {
              logos: newLogos,
              ...stats,
            });

            const { nextTurn } = get();
            if (nextTurn) {
              nextTurn();
            }
          },
        };
      }),
      {
        name: 'guess-logo-game',
        partialize: state => ({
          phase: state.phase,
          players: state.players,
          hostId: state.hostId,
          settings: state.settings,
          turnState: state.turnState,
          // Don't persist loading states
        }),
      },
    ),
    { name: 'GuessLogoStore' },
  ),
);

// ============ Helper Functions ============
export function getPlayerStats(logos: any[]) {
  const activeLogos = logos.filter(logo => !logo.eliminated);
  return {
    activeCount: activeLogos.length,
    winner: activeLogos.length === 1 && logos.length > 0 ? activeLogos[0] : null,
  };
}

// ============ Selectors ============
export const guessLogoSelectors = {
  getCurrentPlayer: () => {
    const { players, turnState } = useGuessLogoStore.getState();
    if (!turnState)
      return undefined;
    return players.find(p => p.id === turnState.currentPlayerId);
  },

  canStartGame: () => {
    const { players } = useGuessLogoStore.getState();
    return (
      players.length === 2
      && players.every(p => p.name.trim().length >= 2 && p.name.trim().length <= 20)
      && players.some(p => p.logos.length > 0)
    );
  },

  getWinner: () => {
    const { players } = useGuessLogoStore.getState();
    return players.find(p => p.winner !== null);
  },
};
