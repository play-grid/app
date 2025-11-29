import type { Player } from '@guess-logo/game-core';
import type {
  FiveSecondsGameSettings as FiveSecondsGameSettingsSchema,
  VotingState,
} from './logic/schema';
import type { Category, Difficulty } from './schema';

export type { Category, Difficulty, VotingState };

export type FiveSecondsGameSettings = FiveSecondsGameSettingsSchema;

// TODO: new player already have score
export interface FiveSecondsPlayer extends Player {
  score: number;
}
