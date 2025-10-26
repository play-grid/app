import type { GameStore, Player } from '../types/core';

// This is a placeholder for the actual oRPC client
interface oRPCClient {
  // This is a placeholder for the actual subscription method
  subscribe: (onStateUpdate: (state: any) => void) => void;
}

export function subscribeToStateUpdates<TSettings, TPlayer extends Player>(
  store: GameStore<TSettings, TPlayer>,
  orpcClient: oRPCClient,
) {
  orpcClient.subscribe((newState) => {
    // We are assuming the server sends the entire state on every update
    // A more optimized approach would be to send only the diff
    store.setPlayers(newState.players);
    store.setPhase(newState.phase);
    store.updateSettings(newState.settings);
    if (newState.turnState) {
      store.setCurrentPlayer?.(newState.turnState.currentPlayerId);
    }
  });
}
