import type { Player } from '@guess-logo/game-core';

// TODO: new player already have score
export interface FiveSecondsPlayer extends Player {
  score: number;
}
