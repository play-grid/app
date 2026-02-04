import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { createFiveSecondsEffects } from './logic/effect-handlers';
import { fiveSecondsGameReducer } from './logic/reducer';
import { FiveSecondsActionSchema, FiveSecondsGameStateSchema } from './logic/schema';
import { validateFiveSecondsAction } from './logic/validator';

// Feature flag to disable custom questions functionality entirely
export const ENABLE_CUSTOM_QUESTIONS_FEATURE = false;

export const fiveSecondsGame = createGameDefinition({
  meta: {
    id: 'five-seconds',
    version: '1.0.0',
    name: { en: 'Five Seconds', ar: 'خمس ثواني' },
    description: { en: 'Answer questions as fast as you can in five seconds!', ar: 'أجب على الأسئلة بأسرع ما يمكن في خمس ثوانٍ!' },
    imageUrl: '/assets/games/5s/5s-thumbnail.jpg',
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
      categoryIds: [],
      difficulty: 'all',
      timePerTurn: 5,
      pointsToWin: 10,
      useCustomQuestions: false,
      customCategoryIds: [],
    },
    votingState: null,
    seenQuestionIds: [],
    currentQuestion: null,
    questions: [],
    turnTimerEndsAt: null,
    readingTime: 0,
    readingTimerEndsAt: null,
    questionError: null,
  },
  validator: validateFiveSecondsAction,
  customReducer: fiveSecondsGameReducer,
});

registerGame(fiveSecondsGame, apiUrl => createFiveSecondsEffects(apiUrl));
