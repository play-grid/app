import type { BaseGameState } from '../../game-logic/schema/state.types';
import { useRef, useSyncExternalStore } from 'react';
import { useAdapter } from '../adapter-context';

export function useGameState<TSelected = BaseGameState>(
  selector?: (state: BaseGameState) => TSelected,
): TSelected {
  const adapter = useAdapter();
  const lastSnapshotRef = useRef<TSelected | undefined>(undefined);
  const lastStateRef = useRef<BaseGameState | undefined>(undefined);

  const getSnapshot = () => {
    const state = adapter.getState();

    // If state hasn't changed, return the cached snapshot
    if (lastStateRef.current === state && lastSnapshotRef.current !== undefined) {
      return lastSnapshotRef.current;
    }

    const snapshot = selector ? selector(state) : (state as unknown as TSelected);

    // Cache the state and snapshot
    lastStateRef.current = state;
    lastSnapshotRef.current = snapshot;

    return snapshot;
  };

  return useSyncExternalStore(
    adapter.subscribe,
    getSnapshot,
    getSnapshot,
  );
}

// CONVENIENCE SELECTORS

export function useGamePhase() {
  return useGameState(state => state.phase);
}

export function useGamePlayers() {
  return useGameState(state => Object.values(state.players));
}

export function useGamePlayer(playerId: string) {
  return useGameState(state => state.players[playerId]);
}

export function useCurrentPlayer() {
  return useGameState((state) => {
    if (!state.turnState)
      return undefined;
    return state.players[state.turnState.currentPlayerId];
  });
}

export function useHostPlayer() {
  return useGameState(state =>
    state.players[state.hostId],
  );
}

export function useGameSettings() {
  return useGameState(state => state.settings);
}

export function useGameSetting<T = unknown>(key: string): T | undefined {
  return useGameState(state => state.settings[key] as T | undefined);
}

export function useTurnState() {
  return useGameState(state => state.turnState);
}

export function useIsPlayerTurn(playerId: string) {
  return useGameState(state =>
    state.turnState?.currentPlayerId === playerId,
  );
}

export function useCurrentRound() {
  return useGameState(state => state.turnState?.roundNumber ?? 0);
}

export function useCurrentTurn() {
  return useGameState(state => state.turnState?.turnNumber ?? 0);
}

export function useAllPlayersReady() {
  return useGameState((state) => {
    const players = Object.values(state.players);
    return players.length > 0 && players.every(p => p.isReady);
  });
}

export function usePlayerCount() {
  return useGameState(state => Object.values(state.players).length);
}

export function usePlayersObject() {
  return useGameState(state => state.players);
}

export function usePlayerOrder() {
  return useGameState(state => state.turnState?.playerOrder ?? []);
}

export function usePlayerExists(playerId: string) {
  return useGameState(state => playerId in state.players);
}

export function useTurnDirection() {
  return useGameState(state => state.turnState?.direction ?? 'forward');
}

export function useTurnPhase() {
  return useGameState(state => state.turnState?.phase);
}

export function useSkipsRemaining() {
  return useGameState(state => state.turnState?.skipsRemaining ?? 0);
}

export function useCurrentPlayerIndex() {
  return useGameState(state => state.turnState?.currentPlayerIndex ?? -1);
}
