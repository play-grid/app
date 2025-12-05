import type { GameDefinition } from '@guess-logo/game-core';
import type { FiveSecondsAction, FiveSecondsGameState } from './logic/schema';
import { composeReducers, gameReducer, registerGame } from '@guess-logo/game-core';
import { fiveSecondsGameReducer } from './logic/reducer';
import { FiveSecondsActionSchema, FiveSecondsGameStateSchema } from './logic/schema';

const composedReducer = composeReducers<FiveSecondsGameState, FiveSecondsAction>(
  fiveSecondsGameReducer,
  gameReducer,
);

export const fiveSecondsGame: GameDefinition<
  typeof FiveSecondsGameStateSchema,
  typeof FiveSecondsActionSchema
> = {
  meta: {
    id: 'five-seconds',
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

  reducer: composedReducer,
};

registerGame(fiveSecondsGame);
