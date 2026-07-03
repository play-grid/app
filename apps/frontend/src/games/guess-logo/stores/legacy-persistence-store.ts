import type { LogoSetKey, Player } from '@playgrid/shared/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logger } from '@/utils/logger';

export interface SavedGameState {
  playerA: Player;
  playerB: Player;
  selectedSet: LogoSetKey;
  selectedList: string;
  selectedGrid: string;
  gameStarted: boolean;
  gameInitialized: boolean;
  timestamp: number;
}

export interface SavedGameInfo {
  playerA: string;
  playerB: string;
  selectedSet: LogoSetKey;
  selectedList: string; // Added selectedList
  selectedGrid: string;
}

export interface PersistenceState {
  savedGameInfo: SavedGameInfo | null;

  // Actions
  saveGameState: (gameState: Omit<SavedGameState, 'timestamp'>) => void;
  loadGameState: () => SavedGameState | null;
  clearGameState: () => void;
  hasValidSavedGame: () => boolean;
  setSavedGameInfo: (info: SavedGameInfo | null) => void;

  // Auto-save management
  lastSaveHash: string;
  updateLastSaveHash: (hash: string) => void;
}

const STORAGE_KEY = 'logo-guessing-game-state';
const MAX_STORAGE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined')
      return false;
    const test = '__test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  }
  catch {
    return false;
  }
}

function isValidGameState(state: any): state is SavedGameState {
  return (
    state
    && typeof state === 'object'
    && state.playerA
    && typeof state.playerA.name === 'string'
    && Array.isArray(state.playerA.logos)
    && state.playerB
    && typeof state.playerB.name === 'string'
    && Array.isArray(state.playerB.logos)
    && typeof state.selectedSet === 'string'
    && typeof state.selectedList === 'string' // Added validation
    && typeof state.selectedGrid === 'string'
    && typeof state.gameStarted === 'boolean'
    && typeof state.gameInitialized === 'boolean'
    && typeof state.timestamp === 'number'
  );
}

export const usePersistenceStore = create<PersistenceState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      savedGameInfo: null,
      lastSaveHash: '',

      // Actions
      saveGameState: (gameState) => {
        if (!isLocalStorageAvailable())
          return;
        try {
          const stateWithTimestamp: SavedGameState = {
            ...gameState,
            timestamp: Date.now(),
          };

          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));

          // Update saved game info for UI
          set((state) => {
            state.savedGameInfo = {
              playerA: gameState.playerA.name,
              playerB: gameState.playerB.name,
              selectedSet: gameState.selectedSet,
              selectedList: gameState.selectedList, // Added selectedList
              selectedGrid: gameState.selectedGrid,
            };
          });
        }
        catch (error) {
          logger.error(error, 'Failed to save game state:');
        }
      },

      loadGameState: () => {
        if (!isLocalStorageAvailable())
          return null;
        try {
          const saved = window.localStorage.getItem(STORAGE_KEY);
          if (!saved)
            return null;

          const gameState = JSON.parse(saved);
          if (!isValidGameState(gameState)) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
          }

          // Check age - expire after 24 hours
          const age = Date.now() - gameState.timestamp;
          if (age > MAX_STORAGE_AGE) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
          }

          // Validate that players have logos
          if (gameState.playerA.logos.length === 0 || gameState.playerB.logos.length === 0) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
          }

          return gameState;
        }
        catch (error) {
          logger.error(error, 'Failed to load game state:');
          if (isLocalStorageAvailable()) {
            window.localStorage.removeTime(STORAGE_KEY);
          }
          return null;
        }
      },

      clearGameState: () => {
        if (!isLocalStorageAvailable())
          return;
        try {
          window.localStorage.removeItem(STORAGE_KEY);
          set((state) => {
            state.savedGameInfo = null;
            state.lastSaveHash = '';
          });
        }
        catch (error) {
          logger.error(error, 'Failed to clear game state:');
        }
      },

      hasValidSavedGame: () => {
        try {
          const { loadGameState } = get();
          const saved = loadGameState();
          return (
            saved !== null
            && saved.gameStarted
            && saved.playerA?.logos?.length > 0
            && saved.playerB?.logos?.length > 0
          );
        }
        catch {
          return false;
        }
      },

      setSavedGameInfo: savedGameInfo =>
        set((state) => {
          state.savedGameInfo = savedGameInfo;
        }),

      updateLastSaveHash: lastSaveHash =>
        set((state) => {
          state.lastSaveHash = lastSaveHash;
        }),
    })),
    { name: 'PersistenceStore' },
  ),
);
