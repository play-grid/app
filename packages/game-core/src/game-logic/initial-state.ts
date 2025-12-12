import type { BaseGameState } from './schema/state.types';

/**
 * The base initial state for any game.
 * Games can extend this with their own specific initial state.
 */
export const BASE_INITIAL_STATE: BaseGameState = {
  phase: 'lobby',
  players: {},
  hostId: '',
  settings: {},
  createdAt: Date.now(),
};
