import type { Player } from '@playgrid/game-core';

// TODO: new player already have score
export interface FiveSecondsPlayer extends Player {
  score: number;
}
