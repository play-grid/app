import type { Player, TurnState } from '../types/core';

// ============ Player Helpers ============

export function findPlayer<T extends Player>(
  players: T[],
  playerId: string,
): T | undefined {
  return players.find(p => p.id === playerId);
}

export function getHostPlayer<T extends Player>(players: T[]): T | undefined {
  return players.find(p => p.isHost);
}

export function areAllPlayersReady<T extends Player>(players: T[]): boolean {
  return players.length > 0 && players.every(p => p.isReady);
}

export function getReadyPlayers<T extends Player>(players: T[]): T[] {
  return players.filter(p => p.isReady);
}

export function reassignHost<T extends Player>(players: T[]): T[] {
  if (players.length === 0)
    return [];

  const hasHost = players.some(p => p.isHost);
  if (hasHost)
    return players;

  // Assign first player as host
  return players.map((p, i) => ({
    ...p,
    isHost: i === 0,
  }));
}

// ============ Turn Helpers ============

export function getNextTurnIndex(
  currentIndex: number,
  playerCount: number,
): number {
  return (currentIndex + 1) % playerCount;
}

export function getPreviousTurnIndex(
  currentIndex: number,
  playerCount: number,
): number {
  return (currentIndex - 1 + playerCount) % playerCount;
}

export function getPlayerByTurnIndex<T extends Player>(
  players: T[],
  turnIndex: number,
): T | undefined {
  return players[turnIndex];
}

export function getCurrentPlayer<T extends Player>(
  players: T[],
  turnState?: TurnState,
): T | undefined {
  if (!turnState)
    return undefined;
  return findPlayer(players, turnState.currentPlayerId);
}

export function initializeTurnState<T extends Player>(
  players: T[],
): TurnState | undefined {
  if (players.length === 0)
    return undefined;

  return {
    currentPlayerId: players[0].id,
    turnIndex: 0,
    roundNumber: 1,
  };
}

export function rotateTurn<T extends Player>(
  players: T[],
  currentTurnState: TurnState,
): TurnState {
  const nextIndex = getNextTurnIndex(currentTurnState.turnIndex, players.length);
  const nextPlayer = players[nextIndex];

  return {
    currentPlayerId: nextPlayer?.id || '',
    turnIndex: nextIndex,
    roundNumber: nextIndex === 0
      ? currentTurnState.roundNumber + 1
      : currentTurnState.roundNumber,
  };
}

// ============ Timer Helpers ============

export function createTimer(
  durationMs: number,
  onTick?: (remaining: number) => void,
  onComplete?: () => void,
): { start: () => void; stop: () => void; reset: () => void } {
  let intervalId: NodeJS.Timeout | null = null;
  let remaining = durationMs;

  return {
    start: () => {
      if (intervalId)
        return;

      intervalId = setInterval(() => {
        remaining -= 1000;
        onTick?.(remaining);

        if (remaining <= 0) {
          clearInterval(intervalId!);
          intervalId = null;
          onComplete?.();
        }
      }, 1000);
    },

    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },

    reset: () => {
      remaining = durationMs;
    },
  };
}

// ============ Scoring Helpers ============

export function rankPlayersByScore<T extends Player & { score?: number }>(
  players: T[],
): T[] {
  return [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
}

export function getWinners<T extends Player & { score?: number }>(
  players: T[],
): T[] {
  const ranked = rankPlayersByScore(players);
  if (ranked.length === 0)
    return [];

  const highScore = ranked[0].score || 0;
  return ranked.filter(p => (p.score || 0) === highScore);
}

// ============ ID Generation ============

export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
