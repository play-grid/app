import type { BaseGameStateWire, GamePhase, Player } from './schema/state.types';

/**
 * A pure function that returns a new state with the phase updated.
 * This is generic over the state `TState` to preserve any custom fields.
 */
export function changePhase<TState extends BaseGameStateWire>(
  state: TState,
  phase: GamePhase,
): TState {
  return { ...state, phase };
}

/**
 * A pure function that returns a new state with a player added.
 * It's generic over `TState` and uses indexed access types on `TState`
 * to correctly handle custom player properties.
 */
export function addPlayer<TState extends BaseGameStateWire>(
  state: TState,

  playerData: Omit<TState['players'][string], 'isHost' | 'isReady' | 'score'>,
  maxPlayers?: number,
): TState {
  const { players, hostId } = state;

  if (maxPlayers && Object.keys(players).length >= maxPlayers) {
    return state;
  }

  const newPlayer = {
    ...(playerData as TState['players'][string]),
    isHost: Object.keys(players).length === 0,
    isReady: false,
    score: 0,
  };

  return {
    ...state,
    players: {
      ...players,
      [newPlayer.id]: newPlayer,
    },
    hostId: hostId ?? newPlayer.id,
  };
}

/**
 * A pure function that returns a new state with a player removed.
 * This is also generic to ensure it works with any custom game state.
 */
export function removePlayer<TState extends BaseGameStateWire>(
  state: TState,
  playerId: Player['id'],
): TState {
  const { players, hostId } = state;
  const { [playerId]: removedPlayer, ...remainingPlayers } = players;

  if (!removedPlayer) {
    return state;
  }

  if (hostId !== playerId) {
    return { ...state, players: remainingPlayers as TState['players'] };
  }

  const remainingPlayerIds = Object.keys(remainingPlayers);
  if (remainingPlayerIds.length === 0) {
    return { ...state, players: {} as TState['players'], hostId: '' };
  }

  const newHostId = remainingPlayerIds[0];
  const newPlayers = {
    ...remainingPlayers,
    [newHostId]: {
      ...remainingPlayers[newHostId],
      isHost: true,
    },
  };

  return {
    ...state,
    players: newPlayers as TState['players'],
    hostId: newHostId,
  };
}
