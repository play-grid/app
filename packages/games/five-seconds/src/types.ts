import type { Player } from '@guess-logo/game-core';
import type { Category, Difficulty } from './schema';

export type { Category, Difficulty };

// TODO: new player already have score
export interface FiveSecondsPlayer extends Player {
  score: number;
}
