import type { LogoSetKey } from '../lib/logo-data';
import type { LogoItem, Player } from './game-state.types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type { LogoItem, Player } from './game-state.types';

export interface GameState {
  selectedSet: LogoSetKey;
  selectedList: string;
  selectedGrid: string;
  playerA: Player;
  playerB: Player;
  gameStarted: boolean;
  gameInitialized: boolean;
  listIsEmpty: boolean;
  gridCols: number;

  // Actions
  setGameLogos: (logos: LogoItem[]) => void;
  setSelectedSet: (set: LogoSetKey) => void;
  setSelectedList: (listId: string) => void;
  setSelectedGrid: (grid: string) => void;
  setPlayerAName: (name: string) => void;
  setPlayerBName: (name: string) => void;
  initializeGame: (logos: LogoItem[]) => void;
  resetGame: () => void;

  // Logo Management
  togglePlayerALogo: (logoId: string | number) => void;
  togglePlayerBLogo: (logoId: string | number) => void;

  // Helpers
  getPlayerStats: (logos: LogoItem[]) => { activeCount: number; winner: LogoItem | null };

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
        selectedSet: 'companies',
        selectedList: 'companies',
        selectedGrid: '8x6',
        playerA: initialPlayerA,
        playerB: initialPlayerB,
        gameStarted: false,
        gameInitialized: false,
        listIsEmpty: false,
        gridCols: 4,

        setGridCols: (cols) => {
          set({ gridCols: cols });
        },

        setSelectedSet: (selectedSet) => {
          set((state) => {
            state.selectedSet = selectedSet;
            state.selectedList = '';
            state.playerA.logos = [];
            state.playerB.logos = [];
            state.gameInitialized = false;
            state.listIsEmpty = false;
          });
        },

        setSelectedList: selectedList =>
          set((state) => {
            state.selectedList = selectedList;
            state.playerA.logos = [];
            state.playerB.logos = [];
            state.gameInitialized = false;
            state.listIsEmpty = false;
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

        setGameLogos: (logos: LogoItem[]) =>
          set((state) => {
            const { getPlayerStats } = get();
            const stats = getPlayerStats(logos);

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

            state.gameStarted = true;
            state.gameInitialized = true;
            state.listIsEmpty = logos.length === 0;
          }),

        initializeGame: initialLogos =>
          set((state) => {
            const { getPlayerStats } = get();
            const stats = getPlayerStats(initialLogos);

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
            state.listIsEmpty = initialLogos.length === 0;
          }),

        resetGame: () =>
          set((state) => {
            state.playerA = {
              ...initialPlayerA,
              name: state.playerA.name,
            };
            state.playerB = {
              ...initialPlayerB,
              name: state.playerB.name,
            };
            state.gameStarted = false;
            state.gameInitialized = false;
            state.selectedSet = 'companies';
            state.selectedList = 'companies';
            state.selectedGrid = '8x6';
            state.listIsEmpty = false;
          }),

        togglePlayerALogo: logoId =>
          set((state) => {
            const { getPlayerStats } = get();

            state.playerA.logos = state.playerA.logos.map(logo =>
              logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
            );

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

            const stats = getPlayerStats(state.playerB.logos);
            state.playerB.activeCount = stats.activeCount;
            state.playerB.winner = stats.winner;
          }),

        getPlayerStats: (logos) => {
          const activeLogos = logos.filter(logo => !logo.eliminated);
          return {
            activeCount: activeLogos.length,
            winner: activeLogos.length === 1 && logos.length > 0 ? activeLogos[0] : null,
          };
        },
      })),
      {
        name: 'logo-guessing-game-storage',
        partialize: state => ({
          selectedSet: state.selectedSet,
          selectedList: state.selectedList,
          selectedGrid: state.selectedGrid,
          playerA: state.playerA,
          playerB: state.playerB,
          gameStarted: state.gameStarted,
          gameInitialized: state.gameInitialized,
          gridCols: state.gridCols,
        }),
      },
    ),
    { name: 'GameStore' },
  ),
);
