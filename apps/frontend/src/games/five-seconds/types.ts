import type { Player } from '@guess-logo/game-core/types';

// TODO: WILL MAKE CATEGORIES DYNAMIC LATER using API
export const CATEGORIES = ['Movies', 'Music', 'History', 'Science', 'General Knowledge'] as const;
export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Vote {
  playerId: string;
  isValid: boolean; // true = valid answer, false = invalid
}

export interface VotingState {
  isVoting: boolean;
  votes: Vote[];
  voters: string[]; // Player IDs of those who need to vote
  currentVoterIndex: number;
}

export interface FiveSecondsGameSettings {
  categories: Category[];
  difficulty: Difficulty;
  timePerTurn: number; // in seconds
}

export interface FiveSecondsPlayer extends Player {
  score: number;
}
