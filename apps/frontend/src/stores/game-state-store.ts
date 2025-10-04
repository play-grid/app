import type {
  LogoItem,
  LogoSetKey,
  Player,
  SharedGameState,
  SupportedLanguage,
} from '@guess-logo/shared/types';
import { shuffleArray } from '@guess-logo/shared/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fetchLogoLists } from '@/services/logo-lists-service';
import { fetchLogos } from '@/services/logo-query-service';

export interface GameState extends SharedGameState {
  // Game Status
  isUpdatingList: boolean;
  isUpdatingLogos: boolean;

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
  shuffleLogos: () => void;

  // Game Initialization
  initializeGame: (logos: LogoItem[]) => void;
  resetGame: () => void;
  startNewGame: () => void;

  // Logo Management
  togglePlayerALogo: (logoId: number) => void;
  togglePlayerBLogo: (logoId: number) => void;

  // Computed helpers
  getPlayerStats: (logos: LogoItem[]) => { activeCount: number; winner: LogoItem | null };
  canStartGame: (hasLogos: boolean) => boolean;

  // Server state sync
  applyServerState: (gameState: Partial<SharedGameState>) => void;
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

        updateLogosForList: async (listId, logoSet, language, count) => {
          const { gameInitialized, selectedList, selectedSet: currentSet } = get();
          if (gameInitialized && selectedList === listId && currentSet === logoSet) {
            return;
          }
          set({ isUpdatingLogos: true });
          try {
            const fetchedLogos = await fetchLogos(logoSet, listId, language, count);

            const logos: LogoItem[] = fetchedLogos.map(logo => ({
              id: logo.id,
              name: logo.name,
              originalName: logo.originalName,
              imageUrl: logo.imageUrl,
              eliminated: false,
              countryData: logo.countryData,
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
          set({ isUpdatingList: true });
          try {
            const lists = await fetchLogoLists(selectedSet);
            const defaultList = lists[0]?.id || '';
            set((state) => {
              state.selectedSet = selectedSet;
              state.selectedList = defaultList;
            });
          }
          catch (error) {
            console.error('Failed to update selected set', error);
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
        shuffleLogos: () =>
          set((state) => {
            state.playerA.logos = shuffleArray(state.playerA.logos);
            state.playerB.logos = shuffleArray(state.playerB.logos);
          }),
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
        }),
      },
    ),
    { name: 'GameStore' },
  ),
);
