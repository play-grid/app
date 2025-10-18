import type { Player } from '@guess-logo/game-core/types';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

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
  categoryIds: string[];
  difficulty: Difficulty;
  timePerTurn: number; // in seconds
}

export interface FiveSecondsPlayer extends Player {
  score: number;
}
