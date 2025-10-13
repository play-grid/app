import type { Player } from '@guess-logo/game-core/types';

// TODO: WILL MAKE CATEGORIES DYNAMIC LATER using API
export const CATEGORIES = ['Movies', 'Music', 'History', 'Science', 'General Knowledge'] as const;
export type Category = typeof CATEGORIES[number];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type Difficulty = typeof DIFFICULTIES[number];

export interface FiveSecondsGameSettings {
  categories: Category[];
  difficulty: Difficulty;
  timePerTurn: number; // in seconds
}

// maybe make the score default in the core Generic Player type OR make the score in the metadata json field instead of extending the Player type
export interface FiveSecondsPlayer extends Player {
  score: number;
}
