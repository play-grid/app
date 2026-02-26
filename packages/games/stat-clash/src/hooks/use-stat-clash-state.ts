import type { StatClashGameState } from '../logic/schema';
import { useGameState } from '@guess-logo/game-core';

export function useStatClashState(): StatClashGameState {
  return useGameState() as StatClashGameState;
}

export type { StatClashGameState } from '../logic/schema';
