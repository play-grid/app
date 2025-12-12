import type { BaseGameState } from '../../game-logic/schema/state.types';
import { useSyncExternalStore } from 'react';
import { useAdapter } from '../adapter-context';

/**
 * Hook to read game state with optional selector for performance optimization.
 * Only re-renders when the selected value changes (using shallow equality).
 *
 * @example
 * ```tsx
 * // Get entire state
 * const state = useGameState();
 *
 * // Select specific field (recommended for performance)
 * const players = useGameState(state => state.players);
 * const phase = useGameState(state => state.phase);
 *
 * // Select derived data
 * const playerCount = useGameState(
 *   state => Object.keys(state.players).length
 * );
 * ```
 *
 * @param selector - Optional function to select a subset of state
 * @returns The selected state value
 */
export function useGameState<TSelected = BaseGameState>(
  selector?: (state: BaseGameState) => TSelected,
): TSelected {
  const adapter = useAdapter();

  // If no selector provided, return entire state
  const getSnapshot = () => {
    const state = adapter.getState();
    return selector ? selector(state) : (state as unknown as TSelected);
  };

  // useSyncExternalStore handles subscription and snapshot management
  return useSyncExternalStore(
    adapter.subscribe,
    getSnapshot,
    getSnapshot,
  );
}

// Convenience Selectors (Pre-built for common use cases)

/**
 * Get the current game phase.
 * @example const phase = useGamePhase(); // 'lobby' | 'playing' | 'results'
 */
export function useGamePhase() {
  return useGameState(state => state.phase);
}

/**
 * Get all players as an array.
 * @example const players = useGamePlayers();
 */
export function useGamePlayers() {
  return useGameState(state => Object.values(state.players));
}

/**
 * Get a specific player by ID.
 * @example const player = useGamePlayer('player-123');
 */
export function useGamePlayer(playerId: string) {
  return useGameState(state => state.players[playerId]);
}

/**
 * Get the current player (based on turn state).
 * @example const currentPlayer = useCurrentPlayer();
 */
export function useCurrentPlayer() {
  return useGameState((state) => {
    if (!state.turnState)
      return null;
    return state.players[state.turnState.currentPlayerId];
  });
}

/**
 * Get the host player.
 * @example const host = useHostPlayer();
 */
export function useHostPlayer() {
  return useGameState(state => state.players[state.hostId]);
}

/**
 * Get game settings.
 * @example const settings = useGameSettings();
 */
export function useGameSettings() {
  return useGameState(state => state.settings);
}

/**
 * Get a specific setting by key.
 * @example const maxPlayers = useGameSetting('maxPlayers');
 */
export function useGameSetting<T = unknown>(key: string): T | undefined {
  return useGameState(state => state.settings[key] as T | undefined);
}

/**
 * Get turn state.
 * @example const turnState = useTurnState();
 */
export function useTurnState() {
  return useGameState(state => state.turnState);
}

/**
 * Check if it's a specific player's turn.
 * @example const isMyTurn = useIsPlayerTurn('player-123');
 */
export function useIsPlayerTurn(playerId: string) {
  return useGameState(state =>
    state.turnState?.currentPlayerId === playerId,
  );
}

/**
 * Get the current round number.
 * @example const round = useCurrentRound();
 */
export function useCurrentRound() {
  return useGameState(state => state.turnState?.roundNumber ?? 0);
}

/**
 * Check if all players are ready.
 * @example const allReady = useAllPlayersReady();
 */
export function useAllPlayersReady() {
  return useGameState((state) => {
    const players = Object.values(state.players);
    return players.length > 0 && players.every(p => p.isReady);
  });
}

/**
 * Get player count.
 * @example const count = usePlayerCount();
 */
export function usePlayerCount() {
  return useGameState(state => Object.keys(state.players).length);
}
