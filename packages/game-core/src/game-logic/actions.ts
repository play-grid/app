import type {
  BaseGameState,
  GamePhase,
  Player,
  TurnPhase,
  TurnState,
} from './schema/state.types';

export function initTurnState<T extends BaseGameState>(
  state: T,
  options?: {
    playerOrder?: string[];
    startingPlayerId?: string;
    initialPhase?: TurnPhase;
  },
): T {
  const { playerOrder, startingPlayerId, initialPhase } = options || {};

  const order = playerOrder || Object.keys(state.players);

  if (order.length === 0) {
    return { ...state, turnState: undefined };
  }

  let startIndex = 0;
  if (startingPlayerId) {
    const idx = order.indexOf(startingPlayerId);
    if (idx !== -1)
      startIndex = idx;
  }

  const turnState: TurnState = {
    playerOrder: order,
    currentPlayerIndex: startIndex,
    currentPlayerId: order[startIndex],
    direction: 'forward',
    roundNumber: 1,
    turnNumber: 0,
    phase: initialPhase,
    skipsRemaining: 0,
  };

  return { ...state, turnState };
}

export function nextTurn<T extends BaseGameState>(
  state: T,
  options?: {
    skipCount?: number;
    resetPhase?: TurnPhase;
  },
): T {
  const { turnState } = state;
  if (!turnState)
    return state;

  const { skipCount = 0, resetPhase } = options || {};
  const { playerOrder, currentPlayerIndex, direction, skipsRemaining } = turnState;

  if (playerOrder.length === 0)
    return state;

  const totalSkips = skipCount + skipsRemaining;
  const directionMultiplier = direction === 'forward' ? 1 : -1;
  const moveAmount = (1 + totalSkips) * directionMultiplier;

  const newIndex = (
    currentPlayerIndex
    + moveAmount
    + playerOrder.length * 100
  ) % playerOrder.length;

  const newPlayerId = playerOrder[newIndex];

  const isNewRound = (
    direction === 'forward' && newIndex < currentPlayerIndex
  ) || (
    direction === 'reverse' && newIndex > currentPlayerIndex
  );

  const newTurnState: TurnState = {
    ...turnState,
    currentPlayerIndex: newIndex,
    currentPlayerId: newPlayerId,
    turnNumber: turnState.turnNumber + 1,
    roundNumber: isNewRound ? turnState.roundNumber + 1 : turnState.roundNumber,
    skipsRemaining: 0,
    phase: resetPhase ?? turnState.phase,
  };

  return { ...state, turnState: newTurnState };
}

export function previousTurn<T extends BaseGameState>(state: T): T {
  const { turnState } = state;
  if (!turnState)
    return state;

  const { playerOrder, currentPlayerIndex, direction } = turnState;
  if (playerOrder.length === 0)
    return state;

  const directionMultiplier = direction === 'forward' ? -1 : 1;
  const newIndex = (
    currentPlayerIndex
    + directionMultiplier
    + playerOrder.length
  ) % playerOrder.length;

  return {
    ...state,
    turnState: {
      ...turnState,
      currentPlayerIndex: newIndex,
      currentPlayerId: playerOrder[newIndex],
      turnNumber: Math.max(0, turnState.turnNumber - 1),
    },
  };
}

export function reverseTurnDirection<T extends BaseGameState>(state: T): T {
  if (!state.turnState)
    return state;

  return {
    ...state,
    turnState: {
      ...state.turnState,
      direction: state.turnState.direction === 'forward' ? 'reverse' : 'forward',
    },
  };
}

export function skipPlayers<T extends BaseGameState>(
  state: T,
  count: number = 1,
): T {
  if (!state.turnState)
    return state;

  return {
    ...state,
    turnState: {
      ...state.turnState,
      skipsRemaining: state.turnState.skipsRemaining + count,
    },
  };
}

export function setCurrentPlayer<T extends BaseGameState>(
  state: T,
  playerId: string,
): T {
  const { turnState } = state;
  if (!turnState)
    return state;

  const { playerOrder } = turnState;
  const newIndex = playerOrder.indexOf(playerId);

  if (newIndex === -1)
    return state;

  return {
    ...state,
    turnState: {
      ...turnState,
      currentPlayerIndex: newIndex,
      currentPlayerId: playerId,
    },
  };
}

export function setTurnPhase<T extends BaseGameState>(
  state: T,
  phase: TurnPhase,
): T {
  if (!state.turnState)
    return state;

  return {
    ...state,
    turnState: {
      ...state.turnState,
      phase,
    },
  };
}

export function reorderPlayers<T extends BaseGameState>(
  state: T,
  newOrder: string[],
): T {
  if (!state.turnState)
    return state;

  const invalidPlayers = newOrder.filter(id => !state.players[id]);
  if (invalidPlayers.length > 0)
    return state;

  const { currentPlayerId } = state.turnState;
  const newIndex = newOrder.indexOf(currentPlayerId);

  if (newIndex === -1)
    return state;

  return {
    ...state,
    turnState: {
      ...state.turnState,
      playerOrder: newOrder,
      currentPlayerIndex: newIndex,
    },
  };
}

export function nextRound<T extends BaseGameState>(
  state: T,
  options?: {
    startingPlayerId?: string;
    resetPhase?: TurnPhase;
  },
): T {
  const { turnState } = state;
  if (!turnState)
    return state;

  const { startingPlayerId, resetPhase } = options || {};
  const { playerOrder } = turnState;

  let startIndex = 0;
  if (startingPlayerId) {
    const idx = playerOrder.indexOf(startingPlayerId);
    if (idx !== -1)
      startIndex = idx;
  }

  return {
    ...state,
    turnState: {
      ...turnState,
      roundNumber: turnState.roundNumber + 1,
      turnNumber: 0,
      currentPlayerIndex: startIndex,
      currentPlayerId: playerOrder[startIndex],
      phase: resetPhase ?? turnState.phase,
      skipsRemaining: 0,
    },
  };
}

export function removePlayerFromTurnOrder<T extends BaseGameState>(
  state: T,
  playerId: string,
): T {
  const { turnState } = state;
  if (!turnState)
    return state;

  const { playerOrder, currentPlayerIndex } = turnState;
  const removeIndex = playerOrder.indexOf(playerId);

  if (removeIndex === -1)
    return state;

  const newOrder = playerOrder.filter(id => id !== playerId);

  if (newOrder.length === 0) {
    return { ...state, turnState: undefined };
  }

  let newIndex = currentPlayerIndex;
  if (removeIndex < currentPlayerIndex) {
    newIndex = currentPlayerIndex - 1;
  }
  else if (removeIndex === currentPlayerIndex) {
    newIndex = currentPlayerIndex % newOrder.length;
  }

  return {
    ...state,
    turnState: {
      ...turnState,
      playerOrder: newOrder,
      currentPlayerIndex: newIndex,
      currentPlayerId: newOrder[newIndex],
    },
  };
}

export function changePhase<T extends BaseGameState>(
  state: T,
  phase: GamePhase,
): T {
  return { ...state, phase };
}

export function addPlayer<T extends BaseGameState>(
  state: T,
  playerData: Partial<Player> & { id: string; name: string },
): T {
  const { players, hostId } = state;
  if (players[playerData.id]) {
    return state;
  }

  const newPlayer: Player = {
    id: playerData.id,
    name: playerData.name,
    avatar: playerData.avatar,
    isHost: Object.keys(players).length === 0,
    isReady: false,
    score: 0,
  };

  return {
    ...state,
    players: {
      ...players,
      [newPlayer.id]: newPlayer,
    } as T['players'],
    hostId: hostId || newPlayer.id,
  };
}

export function removePlayer<T extends BaseGameState>(
  state: T,
  playerId: Player['id'],
): T {
  const { players, hostId } = state;
  const { [playerId]: removedPlayer, ...remainingPlayers } = players;

  if (!removedPlayer) {
    return state;
  }

  if (hostId !== playerId) {
    return { ...state, players: remainingPlayers as T['players'] };
  }

  const remainingPlayerIds = Object.keys(remainingPlayers);
  if (remainingPlayerIds.length === 0) {
    return { ...state, players: {} as T['players'], hostId: '' };
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
    players: newPlayers as T['players'],
    hostId: newHostId,
  };
}

export function updatePlayer<T extends BaseGameState>(
  state: T,
  playerId: Player['id'],
  updates: Partial<Player>,
): T {
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
    } as T['players'],
  };
}

export function togglePlayerReady<T extends BaseGameState>(
  state: T,
  playerId: Player['id'],
): T {
  const player = state.players[playerId];
  if (!player) {
    return state;
  }
  return updatePlayer(state, playerId, { isReady: !player.isReady });
}

export function updateSettings<T extends BaseGameState>(
  state: T,
  updates: Partial<T['settings']>,
): T {
  return {
    ...state,
    settings: {
      ...state.settings,
      ...updates,
    },
  };
}

export function startGame<T extends BaseGameState>(state: T): T {
  return initTurnState({
    ...state,
    phase: 'playing',
    startedAt: Date.now(),
  }, { initialPhase: 'pre-turn' });
}

export function endGame<T extends BaseGameState>(state: T): T {
  return {
    ...state,
    phase: 'results',
    endedAt: Date.now(),
  };
}

export function resetGame<T extends BaseGameState>(state: T): T {
  const stateToPreserve = {
    players: state.players,
    hostId: state.hostId,
    settings: state.settings,
  };

  return {
    ...state,
    ...stateToPreserve,
    phase: 'lobby',
    players: {} as T['players'],
    turnState: undefined,
    startedAt: undefined,
    endedAt: undefined,
  };
}
