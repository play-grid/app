import type { GameDefinition } from '@guess-logo/game-core/contracts/game-definition';
import { FiveSecondsActionSchema, FiveSecondsGameStateSchema, fiveSecondsReducer } from './logic';

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
    settings: {
      categoryIds: ['cat_general_v1'],
      difficulty: 'all',
      timePerTurn: 5,
      roundsToWin: 5,
    },
  },

  reducer: fiveSecondsReducer,
};
