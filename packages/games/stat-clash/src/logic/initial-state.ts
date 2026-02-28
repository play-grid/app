import type { StatClashGameState } from './schema';

export function createInitialState(
  hostId: string,
  hostName: string,
  mode: 'solo' | 'hotseat' | 'screen' | 'remote',
): StatClashGameState {
  const now = Date.now();

  const playerOrder = mode === 'solo' ? [] : [hostId];

  return {
    phase: 'lobby',
    settings: {
      mode,
      category: 'mixed',
      metricType: undefined,
      difficulty: 'medium',
      timeLimit: undefined,
      streakGoal: undefined,
      roundsPerPlayer: 10,
    },
    players: {
      [hostId]: {
        id: hostId,
        name: hostName,
        score: 0,
        streak: 0,
        roundsPlayed: 0,
        isHost: true,
        isReady: mode === 'solo',
      },
    },
    hostId,
    turnState: playerOrder.length > 0
      ? {
          playerOrder,
          currentPlayerIndex: 0,
          currentPlayerId: hostId,
          direction: 'forward',
          roundNumber: 1,
          turnNumber: 0,
          skipsRemaining: 0,
        }
      : undefined,
    currentRound: null,
    recentRounds: [],
    availableItems: [],
    usedItemIds: [],
    error: null,
    createdAt: now,
    lastActivityAt: now,
  } as StatClashGameState;
}
