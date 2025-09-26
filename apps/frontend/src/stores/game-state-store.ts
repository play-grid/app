import type { LogoSetKey } from '@/lib/logo-data';
import type { LogoItem, Player } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface GameState {
  // Game Configuration
  selectedSet: LogoSetKey;
  selectedGrid: string;

  // Players
  playerA: Player;
  playerB: Player;
  currentPlayer: 'A' | 'B';

  // Game Status
  gameStarted: boolean;
  gameInitialized: boolean;

  // Actions
  setSelectedSet: (set: LogoSetKey) => void;
  setSelectedGrid: (grid: string) => void;
  setPlayerAName: (name: string) => void;
  setPlayerBName: (name: string) => void;
  setCurrentPlayer: (player: 'A' | 'B') => void;
  switchTurn: () => void;

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
  applyServerState: (gameState: Partial<GameState>) => void;
}

const initialPlayerA: Player = {
  name: '',
  logos: [],
  winner: null,
  activeCount: 0,
};

const initialPlayerB: Player = {
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
        selectedGrid: '8x6',
        playerA: initialPlayerA,
        playerB: initialPlayerB,
        currentPlayer: 'A',
        gameStarted: false,
        gameInitialized: false,

        // Configuration actions
        setSelectedSet: selectedSet =>
          set((state) => {
            state.selectedSet = selectedSet;
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
