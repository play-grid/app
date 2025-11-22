import type { GameDefinition } from '@guess-logo/game-core';
import { fiveSecondsGameReducer } from './logic/reducer';
import { FiveSecondsActionSchema, FiveSecondsGameStateSchema } from './logic/schema';

export const fiveSecondsGame: GameDefinition<typeof FiveSecondsGameStateSchema, typeof FiveSecondsActionSchema> = {
  meta: {
    id: 'five-seconds-game',
    name: 'Five seconds',
    minPlayers: 2,
    maxPlayers: 4,
  },

  stateSchema: FiveSecondsGameStateSchema,
  actionSchema: FiveSecondsActionSchema,

  initialState: {
    phase: 'lobby',
    players: {},
    hostId: '',
    createdAt: Date.now(),
    settings: {
      categoryIds: ['cat_general_v1'],
      difficulty: 'all',
      timePerTurn: 5,
      roundsToWin: 5,
    },
    votingState: null,
    seenQuestionIds: [],
  },

  reducer: fiveSecondsGameReducer,
};
