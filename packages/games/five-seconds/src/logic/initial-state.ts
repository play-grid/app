import type { FiveSecondsGameSettings, VotingState } from './schema';
import { difficultySchema } from '../schema';

export const FIVE_SECONDS_INITIAL_SETTINGS: FiveSecondsGameSettings = {
  categoryIds: ['cat_general_v1'],
  difficulty: difficultySchema.enum.easy,
  timePerTurn: 5,
  roundsToWin: 5,
};

export const FIVE_SECONDS_GAME_OPTIONS = {
  maxPlayers: 4,
  minPlayers: 2,
  turnBased: true,
  requireReady: false,
};

export const FIVE_SECONDS_CUSTOM_STATE = {
  votingState: null as VotingState | null,
  seenQuestionIds: [] as string[],
};
