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
 */
export function addPlayer<TState extends BaseGameStateWire>(
  state: TState,
  playerData: Omit<Player, 'isHost' | 'isReady' | 'score'>,
  maxPlayers?: number,
): TState {
  const { players, hostId } = state;

  if (maxPlayers && Object.keys(players).length >= maxPlayers) {
    return state;
  }

  const newPlayer = {
    ...playerData,
    isHost: Object.keys(players).length === 0,
    isReady: false,
    score: 0,
  } as TState['players'][string];

  return {
    ...state,
    players: {
      ...players,
      [newPlayer.id]: newPlayer,
    } as TState['players'],
    hostId: hostId || newPlayer.id,
  };
}

/**
 * A pure function that returns a new state with a player removed.
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

/**
 * A pure function that returns a new state with a player updated.
 */
export function updatePlayer<TState extends BaseGameStateWire>(
  state: TState,
  playerId: Player['id'],
  updates: Partial<Player>,
): TState {
  const { players } = state;
  const playerToUpdate = players[playerId];

  if (!playerToUpdate) {
    return state;
  }

  const updatedPlayer = {
    ...playerToUpdate,
    ...updates,
  };

  return {
    ...state,
    players: {
      ...players,
      [playerId]: updatedPlayer,
    } as TState['players'],
  };
}

/**
 * A pure function that returns a new state with a player's ready status toggled.
 */
export function togglePlayerReady<TState extends BaseGameStateWire>(
  state: TState,
  playerId: Player['id'],
): TState {
  const player = state.players[playerId];
  if (!player) {
    return state;
  }
  return updatePlayer(state, playerId, { isReady: !player.isReady });
}

/**
 * A pure function that returns a new state with the settings updated.
 */
export function updateSettings<TState extends BaseGameStateWire>(
  state: TState,
  updates: Partial<TState['settings']>,
): TState {
  return {
    ...state,
    settings: {
      ...state.settings,
      ...updates,
    },
  };
}

/**
 * A pure function that advances the turn to the next player.
 */
export function nextTurn<TState extends BaseGameStateWire>(state: TState): TState {
  const { turnState, players } = state;

  if (!turnState || Object.keys(players).length === 0) {
    return state;
  }

  const playerIds = Object.keys(players);
  const currentPlayerIndex = playerIds.indexOf(turnState.currentPlayerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
  const nextPlayerId = playerIds[nextPlayerIndex];

  return {
    ...state,
    turnState: {
      ...turnState,
      currentPlayerId: nextPlayerId,
      turnIndex: nextPlayerIndex,
    },
  };
}

/**
 * A pure function that sets the current turn to a specific player.
 */
export function setCurrentPlayer<TState extends BaseGameStateWire>(
  state: TState,
  playerId: Player['id'],
): TState {
  const { turnState, players } = state;
  if (!turnState) {
    return state;
  }

  const playerIds = Object.keys(players);
  const playerIndex = playerIds.indexOf(playerId);

  if (playerIndex === -1) {
    return state;
  }

  return {
    ...state,
    turnState: {
      ...turnState,
      currentPlayerId: playerId,
      turnIndex: playerIndex,
    },
  };
}

/**
 * A pure function that advances the game to the next round.
 */
export function nextRound<TState extends BaseGameStateWire>(state: TState): TState {
  const { turnState, players } = state;
  if (!turnState) {
    return state;
  }

  const playerIds = Object.keys(players);

  return {
    ...state,
    turnState: {
      ...turnState,
      roundNumber: turnState.roundNumber + 1,

      turnIndex: 0,
      currentPlayerId: playerIds[0] ?? '',
    },
  };
}

/**
 * A pure function that transitions the game to the "playing" phase
 * and initializes the turn state.
 */
export function startGame<TState extends BaseGameStateWire>(state: TState): TState {
  const playerIds = Object.keys(state.players);

  return {
    ...state,
    phase: 'playing',
    startedAt: Date.now(),

    turnState:
      playerIds.length > 0
        ? {
            currentPlayerId: playerIds[0],
            turnIndex: 0,
            roundNumber: 1,
          }
        : undefined,
  };
}

/**
 * A pure function that transitions the game to the "results" phase.
 */
export function endGame<TState extends BaseGameStateWire>(state: TState): TState {
  return {
    ...state,
    phase: 'results',
    endedAt: Date.now(),
  };
}

/**
 * A pure function that resets the game state to the lobby,
 * clearing players and game progress but preserving settings.
 */
export function resetGame<TState extends BaseGameStateWire>(state: TState): TState {
  const stateToPreserve = {
    settings: state.settings,
  };

  return {
    ...state,
    ...stateToPreserve,
    phase: 'lobby',
    players: {} as TState['players'],
    hostId: '',
    turnState: undefined,
    startedAt: undefined,
    endedAt: undefined,
  };
}
