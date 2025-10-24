import type { GamePhase } from '../../types/core';

export const GAME_PHASES = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  RESULTS: 'results',
} as const;

// Phase validation
export function isValidPhase(phase: string): phase is GamePhase {
  return ['lobby', 'playing', 'results'].includes(phase);
}

// Phase transitions
export function canTransitionTo(from: GamePhase, to: GamePhase): boolean {
  const validTransitions: Record<GamePhase, GamePhase[]> = {
    lobby: ['playing'],
    playing: ['results'],
    results: ['lobby'], // Can restart
  };
  return validTransitions[from]?.includes(to) ?? false;
}

// Phase helpers
export function isInLobby(phase: GamePhase): boolean {
  return phase === 'lobby';
}

export function isPlaying(phase: GamePhase): boolean {
  return phase === 'playing';
}

export function isFinished(phase: GamePhase): boolean {
  return phase === 'results';
}

// Phase durations (optional, for auto-transitions)
export const PHASE_DURATIONS: Partial<Record<GamePhase, number>> = {
  // results: 10000, // Auto-return to lobby after 10s
};
