import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-state-store';

export interface GameErrorConfig {
  fetchError: Error | null;
  isValidRoute: boolean;
}

export interface GameErrorResult {
  error: string | null;
  hasError: boolean;
}

export function useGameError(config: GameErrorConfig): GameErrorResult {
  const { error, setError } = useUIStore();

  // Set error if fetch fails
  useEffect(() => {
    if (config.fetchError) {
      setError(config.fetchError.message || 'Failed to load logos');
    }
  }, [config.fetchError, setError]);

  // Clear error when route becomes valid (for cleanup)
  useEffect(() => {
    if (config.isValidRoute && error) {
      // Only clear fetch-related errors, not other types
      if (error.includes('load logos') || error.includes('fetch')) {
        setError(null);
      }
    }
  }, [config.isValidRoute, error, setError]);

  return {
    error,
    hasError: Boolean(error),
  };
}
