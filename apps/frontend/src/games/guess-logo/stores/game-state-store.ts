import type {
  SupportedLanguage,
} from '@guess-logo/shared/types';
import type { LogoSetKey } from '../lib/logo-data';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fetchLogos } from '../services/logo-query-service';
import { fetchLogoLists } from '../services/unified-logo-service';

export interface LogoCountryData {
  name: string;
  region: string;
  currency: string;
}

export interface SharedGameState {
  selectedSet: LogoSetKey;
  selectedList: string;
  selectedGrid: string;
  playerA: Player;
  playerB: Player;
  currentPlayer: 'A' | 'B';
  gameStarted: boolean;
  gameInitialized: boolean;
}
export interface LogoItem {
  id: string | number;
  name: string;
  originalName?: string;
  imageUrl: string;
  eliminated: boolean;
  countryData?: LogoCountryData;
  type?: string;
}
export interface Player {
  id: string;
  name: string;
  logos: LogoItem[];
  winner: LogoItem | null;
  activeCount: number;
}

export interface GameState extends SharedGameState {
  // Game Status
  isUpdatingList: boolean;
  isUpdatingLogos: boolean;
  error: string | null;
  listIsEmpty: boolean;

  // Actions
  updateSelectedSet: (set: LogoSetKey) => Promise<void>;
  setSelectedSet: (set: LogoSetKey) => void;
  setSelectedList: (listId: string) => void;
  updateLogosForList: (
    listId: string,
    logoSet: LogoSetKey,
    language: SupportedLanguage,
    count: number,
  ) => Promise<void>;
  setSelectedGrid: (grid: string) => void;
  setPlayerAName: (name: string) => void;
  setPlayerBName: (name: string) => void;
  setCurrentPlayer: (player: 'A' | 'B') => void;
  switchTurn: () => void;
  shuffleLogos: (language: SupportedLanguage) => Promise<void>;
  clearError: () => void;

  // Game Initialization
  initializeGame: (logos: LogoItem[]) => void;
  resetGame: () => void;
  startNewGame: () => void;

  // Logo Management
  togglePlayerALogo: (logoId: string | number) => void;
  togglePlayerBLogo: (logoId: string | number) => void;

  // Computed helpers
  getPlayerStats: (logos: LogoItem[]) => { activeCount: number; winner: LogoItem | null };
  canStartGame: (hasLogos: boolean) => boolean;

  // Server state sync
  applyServerState: (gameState: Partial<SharedGameState>) => void;

  gridCols: number;
  setGridCols: (cols: number) => void;
}

const initialPlayerA: Player = {
  id: '',
  name: '',
  logos: [],
  winner: null,
  activeCount: 0,
};

const initialPlayerB: Player = {
  id: '',
  name: '',
  logos: [],
  winner: null,
  activeCount: 0,
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        selectedSet: 'companies',
        selectedList: 'companies',
        selectedGrid: '8x6',
        playerA: initialPlayerA,
        playerB: initialPlayerB,
        currentPlayer: 'A',
        gameStarted: false,
        gameInitialized: false,
        isUpdatingList: false,
        isUpdatingLogos: false,
        error: null,
        listIsEmpty: false,
        gridCols: 4,

        clearError: () => set({ error: null }),

        setGridCols: (cols) => {
          set({ gridCols: cols });
        },

        updateLogosForList: async (listId, logoSet, language, count) => {
          const { gameInitialized, selectedList, selectedSet: currentSet } = get();
          if (gameInitialized && selectedList === listId && currentSet === logoSet) {
            return;
          }
          set({ isUpdatingLogos: true, error: null, listIsEmpty: false });
          try {
            if (!listId) {
              // If there's no list ID, it's not an error, just nothing to display.
              set({ gameInitialized: false, playerA: { ...get().playerA, logos: [] }, playerB: { ...get().playerB, logos: [] } });
              return;
            }

            const fetchedLogos = await fetchLogos(logoSet, listId, language, count);

            if (fetchedLogos.length === 0) {
              set({
                listIsEmpty: true,
                gameInitialized: false,
                playerA: { ...get().playerA, logos: [] },
                playerB: { ...get().playerB, logos: [] },
              });
              return;
            }

            const logos: LogoItem[] = fetchedLogos.map(logo => ({
              id: logo.id,
              name: logo.name,
              originalName: 'originalName' in logo ? logo.originalName : undefined,
              imageUrl: logo.imageUrl,
              eliminated: false,
              countryData: 'countryData' in logo ? logo.countryData : undefined,
              type: logo.type,
            }));

            // Instead of calling initializeGame from within set callback,
            // we'll inline the logic here to avoid nested set calls
            set((state) => {
              const { getPlayerStats } = get();

              // Initialize logos directly without calling another action
              const stats = getPlayerStats(logos);
              // Initialize both players with the same logos
              state.playerA = {
                ...state.playerA,
                logos: [...logos],
                ...stats,
              };

              state.playerB = {
                ...state.playerB,
                logos: [...logos],
                ...stats,
              };

              // Update other game state
              state.selectedList = listId;
              state.gameStarted = true;
              state.gameInitialized = true;
              state.currentPlayer = 'A';
            });
          }
          catch (error) {
            console.error('Failed to update logos for list', error);
            set({ error: (error as Error).message || 'Failed to fetch logos.' });
          }
          finally {
            set({ isUpdatingLogos: false });
          }
        },

        setSelectedSet: (selectedSet) => {
          set((state) => {
            state.selectedSet = selectedSet;
          });
        },

        updateSelectedSet: async (selectedSet) => {
          set({ isUpdatingList: true, error: null });
          try {
            const lists = await fetchLogoLists(selectedSet);
            if (lists.length > 0) {
              const defaultList = lists[0].id;
              set((state) => {
                state.selectedSet = selectedSet;
                state.selectedList = defaultList;
              });
            }
            else {
              // Handle case with no lists
              set((state) => {
                state.selectedSet = selectedSet;
                state.selectedList = ''; // or some indicator of no list
                state.playerA.logos = [];
                state.playerB.logos = [];
                state.gameInitialized = false;
              });
            }
          }
          catch (error) {
            console.error('Failed to update selected set', error);
            set({ error: (error as Error).message || 'Failed to fetch logo lists.' });
          }
          finally {
            set({ isUpdatingList: false });
          }
        },
        setSelectedList: selectedList =>
          set((state) => {
            state.selectedList = selectedList;
            // Clear logos and reset game initialization to force a refetch
            state.playerA.logos = [];
            state.playerB.logos = [];
            state.gameInitialized = false;
          }),

        setSelectedGrid: selectedGrid =>
          set((state) => {
            state.selectedGrid = selectedGrid;
          }),

        setPlayerAName: name =>
          set((state) => {
            state.playerA.name = name;
          }),

        setPlayerBName: name =>
          set((state) => {
            state.playerB.name = name;
          }),

        setCurrentPlayer: player =>
          set((state) => {
            state.currentPlayer = player;
          }),

        shuffleLogos: async (language) => {
          const state = get();
          if (!state.gameInitialized) {
            return;
          }

          try {
            const fetchedLogos = await fetchLogos(
              state.selectedSet,
              state.selectedList,
              language,
              state.playerA.logos.length,
              true, // Request a shuffled list
            );

            const newLogos: LogoItem[] = fetchedLogos.map(logo => ({
              id: logo.id,
              name: logo.name,
              originalName: 'originalName' in logo ? logo.originalName : undefined,
              imageUrl: logo.imageUrl,
              eliminated: false,
              countryData: 'countryData' in logo ? logo.countryData : undefined,
              type: logo.type,
            }));

            set((s) => {
              const { getPlayerStats } = get();
              const stats = getPlayerStats(newLogos);

              // Both players get the same fresh shuffled logos
              s.playerA.logos = [...newLogos];
              s.playerA.activeCount = stats.activeCount;
              s.playerA.winner = stats.winner;

              s.playerB.logos = [...newLogos];
              s.playerB.activeCount = stats.activeCount;
              s.playerB.winner = stats.winner;
            });
          }
          catch (error) {
            console.error('Failed to shuffle logos', error);
          }
          finally {
            set({ isUpdatingLogos: false });
          }
        },
        switchTurn: () =>
          set((state) => {
            state.currentPlayer = state.currentPlayer === 'A' ? 'B' : 'A';
          }),

        // Game management
        initializeGame: initialLogos =>
          set((state) => {
            const { getPlayerStats } = get();

            // initialLogos should already be in LogoItem format
            const stats = getPlayerStats(initialLogos);

            // Initialize both players with the same logos
            state.playerA = {
              ...state.playerA,
              logos: [...initialLogos],
              ...stats,
            };

            state.playerB = {
              ...state.playerB,
              logos: [...initialLogos],
              ...stats,
            };
            // Don't reset selectedList here - keep it for saving
            state.gameStarted = true;
            state.gameInitialized = true;
            state.currentPlayer = 'A';
          }),

        resetGame: () =>
          set((state) => {
            state.playerA = {
              ...initialPlayerA,
              name: state.playerA.name, // Keep the name
            };
            state.playerB = {
              ...initialPlayerB,
              name: state.playerB.name, // Keep the name
            };
            state.gameStarted = false;
            state.gameInitialized = false;
            state.currentPlayer = 'A';
            state.selectedSet = 'companies';
            state.selectedList = 'companies';
            state.selectedGrid = '8x6';
          }),

        startNewGame: () =>
          set((state) => {
            state.playerA = {
              ...state.playerA,
              logos: [],
              winner: null,
              activeCount: 0,
            };
            state.playerB = {
              ...state.playerB,
              logos: [],
              winner: null,
              activeCount: 0,
            };
            state.gameInitialized = false;
            state.currentPlayer = 'A';
          }),

        // Logo actions
        togglePlayerALogo: logoId =>
          set((state) => {
            const { getPlayerStats } = get();

            state.playerA.logos = state.playerA.logos.map(logo =>
              logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
            );

            // Update stats
            const stats = getPlayerStats(state.playerA.logos);
            state.playerA.activeCount = stats.activeCount;
            state.playerA.winner = stats.winner;
          }),

        togglePlayerBLogo: logoId =>
          set((state) => {
            const { getPlayerStats } = get();

            state.playerB.logos = state.playerB.logos.map(logo =>
              logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
            );

            // Update stats
            const stats = getPlayerStats(state.playerB.logos);
            state.playerB.activeCount = stats.activeCount;
            state.playerB.winner = stats.winner;
          }),

        // Helper functions
        getPlayerStats: (logos) => {
          const activeLogos = logos.filter(logo => !logo.eliminated);
          return {
            activeCount: activeLogos.length,
            winner: activeLogos.length === 1 && logos.length > 0 ? activeLogos[0] : null,
          };
        },

        canStartGame: (hasLogos) => {
          const { playerA, playerB } = get();
          const playerAValid = playerA.name.trim().length >= 2 && playerA.name.trim().length <= 20;
          const playerBValid = playerB.name.trim().length >= 2 && playerB.name.trim().length <= 20;
          return playerAValid && playerBValid && hasLogos;
        },

        applyServerState: (newGameState: Partial<GameState>) =>
          set((state) => {
            Object.assign(state, newGameState);
          }),
      })),
      {
        name: 'logo-guessing-game-storage',
        partialize: state => ({
          selectedSet: state.selectedSet,
          selectedList: state.selectedList,
          selectedGrid: state.selectedGrid,
          playerA: state.playerA,
          playerB: state.playerB,
          currentPlayer: state.currentPlayer,
          gameStarted: state.gameStarted,
          gameInitialized: state.gameInitialized,
          gridCols: state.gridCols,
        }),
      },
    ),
    { name: 'GameStore' },
  ),
);
