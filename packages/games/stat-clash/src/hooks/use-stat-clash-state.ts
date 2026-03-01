import type { StatClashGameState } from '../logic/schema';
import { useGameState } from '@playgrid/game-core';

export function useStatClashState(): StatClashGameState {
  return useGameState() as StatClashGameState;
}

export type { StatClashGameState } from '../logic/schema';
