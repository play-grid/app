import type { NetworkClient } from '../network/client';
import type { GameStore, Player } from '../types/core';
import type { GameEventType } from './orpc-contract';

/**
 * Subscribes a GameStore to real-time updates from a NetworkClient.
 */
export async function subscribeToStateUpdates<TSettings, TPlayer extends Player>(
  store: GameStore<TSettings, TPlayer>,
  client: NetworkClient,
) {
  console.log('[StateSubscriber] Subscribing to state updates...');

  try {
    // Consume the async iterator from the client
    for await (const event of client.onStateUpdate()) {
      handleGameEvent(store, event);
    }
  }
  catch (error) {
    // Handle errors, e.g., disconnection
    console.error('[StateSubscriber] Error in state update loop:', error);
  }
}

/**
 * Handles a single game event and updates the store.
 */
function handleGameEvent<TSettings, TPlayer extends Player>(
  store: GameStore<TSettings, TPlayer>,
  event: GameEventType,
) {
  switch (event.type) {
    case 'state_update':
      // Full state replacement
      store.setPhase(event.state.phase);
      store.setPlayers(event.state.players as TPlayer[]);
      store.updateSettings(event.state.settings as TSettings);
      if (event.state.turnState && store.setCurrentPlayer) {
        store.setCurrentPlayer(event.state.turnState.currentPlayerId);
      }
      break;

    case 'player_joined':
      // Assuming your store has a method for this
      // store.addPlayer(event.player as TPlayer);
      console.log(`[StateSubscriber] Player joined: ${event.player.name}`);
      break;

    case 'player_left':
      // Assuming your store has a method for this
      // store.removePlayer(event.playerId);
      console.log(`[StateSubscriber] Player left: ${event.playerId}`);
      break;

    case 'phase_changed':
      store.setPhase(event.phase);
      break;

    case 'turn_changed':
      if (store.setCurrentPlayer) {
        store.setCurrentPlayer(event.turnState.currentPlayerId);
      }
      break;
  }
}
