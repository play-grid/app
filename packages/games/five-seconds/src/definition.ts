import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { createFiveSecondsEffects } from './logic/effect-handlers';
import { fiveSecondsGameReducer } from './logic/reducer';
import { FiveSecondsActionSchema, FiveSecondsGameStateSchema } from './logic/schema';
import { validateFiveSecondsAction } from './logic/validator';

export const fiveSecondsGame = createGameDefinition({
  meta: {
    id: 'five-seconds',
    name: { en: 'Five Seconds', ar: 'خمس ثواني' },
    description: { en: 'Answer questions as fast as you can in five seconds!', ar: 'أجب على الأسئلة بأسرع ما يمكن في خمس ثوانٍ!' },
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
      difficulty: 'easy',
      timePerTurn: 5,
      roundsToWin: 5,
    },
    votingState: null,
    seenQuestionIds: [],
    currentQuestion: null,
    questions: [],
    turnTimerEndsAt: null,
    questionError: null,
  },
  validator: validateFiveSecondsAction,
  customReducer: fiveSecondsGameReducer,
});

registerGame(fiveSecondsGame, apiUrl => createFiveSecondsEffects(apiUrl));
