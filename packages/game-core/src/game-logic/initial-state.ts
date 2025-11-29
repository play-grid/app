import type { BaseGameStateWire } from './schema/state.types';

/**
 * The base initial state for any game.
 * Games can extend this with their own specific initial state.
 */
export const BASE_INITIAL_STATE: BaseGameStateWire = {
  phase: 'lobby',
  players: {},
  hostId: '',
  settings: {},
  createdAt: Date.now(),
};
