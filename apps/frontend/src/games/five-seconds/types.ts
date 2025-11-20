import type {
  VotingState,
} from '@guess-logo/five-seconds/logic/schema';

import type {
  Category,
  Difficulty,
} from '@guess-logo/five-seconds/schema';
import type { Player } from '@guess-logo/game-core/types';

export type { Category, Difficulty, VotingState };

// TODO: new player already have score
export interface FiveSecondsPlayer extends Player {
  score: number;
}
