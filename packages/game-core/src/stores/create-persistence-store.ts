// packages/game-core/src/stores/create-persistence-store.ts
import { create } from 'zustand';
import { logger } from '../utils/logger';

interface PersistenceStore<T> {
  savedState: T | null;
  lastSaveHash: string | null;
  saveGameState: (state: T) => void;
  loadGameState: () => T | null;
  clearGameState: () => void;
  updateLastSaveHash: (hash: string) => void;
  hasValidSavedGame: () => boolean;
}

interface PersistenceConfig<T> {
  storageKey: string;
  maxAge: number;
  validate: (state: any) => boolean;
  hasValidData?: (state: T | null) => boolean;
}

export function createPersistenceStore<T>({
  storageKey,
  maxAge,
  validate,
  hasValidData,
}: PersistenceConfig<T>) {
  const checkSavedGame = () => {
    try {
      const savedItem = localStorage.getItem(storageKey);
      if (!savedItem)
        return false;

      const parsedItem = JSON.parse(savedItem);
      if (!parsedItem || !parsedItem.timestamp || !parsedItem.data) {
        return false;
      }

      const isExpired = Date.now() - parsedItem.timestamp > maxAge;
      if (isExpired) {
        return false;
      }

      if (!validate(parsedItem.data)) {
        return false;
      }

      if (hasValidData) {
        return hasValidData(parsedItem.data);
      }

      return true;
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (error) {
      return false;
    }
  };

  return create<PersistenceStore<T>>((set, get) => ({
    savedState: null,
    lastSaveHash: null,
    hasValidSavedGame: checkSavedGame,

    saveGameState: (state: T) => {
      try {
        const stateToSave = {
          timestamp: Date.now(),
          data: state,
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        set({ savedState: state });
      }
      catch (error) {
        logger.error(error, 'Failed to save game state:');
      }
    },

    loadGameState: () => {
      try {
        const savedItem = localStorage.getItem(storageKey);
        if (!savedItem)
          return null;

        const parsedItem = JSON.parse(savedItem);
        if (!parsedItem || !parsedItem.timestamp || !parsedItem.data) {
          return null;
        }

        const isExpired = Date.now() - parsedItem.timestamp > maxAge;
        if (isExpired) {
          get().clearGameState();
          return null;
        }

        if (validate(parsedItem.data)) {
          set({ savedState: parsedItem.data });
          return parsedItem.data as T;
        }
        else {
          logger.warn('Saved game state failed validation. Clearing.');
          get().clearGameState();
        }

        return null;
      }
      catch (error) {
        logger.error(error, 'Failed to load game state:');
        get().clearGameState();
        return null;
      }
    },

    clearGameState: () => {
      localStorage.removeItem(storageKey);
      set({ savedState: null, lastSaveHash: null });
    },

    updateLastSaveHash: (hash: string) => {
      set({ lastSaveHash: hash });
    },
  }));
}
