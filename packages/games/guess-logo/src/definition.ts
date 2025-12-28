import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { guessLogoGameReducer } from './logic/reducer';
import { GuessLogoActionSchema, GuessLogoGameStateSchema } from './logic/schema';

export const guessLogoGame = createGameDefinition({
  meta: {
    id: 'guess-logo',
    name: { en: 'Guess the Logo', ar: 'خمن الشعار' },
    description: { en: 'Guess the logos of famous companies and brands!', ar: 'خمن شعارات الشركات والعلامات التجارية الشهيرة!' },
    minPlayers: 2,
    maxPlayers: 2,
  },

  stateSchema: GuessLogoGameStateSchema,
  actionSchema: GuessLogoActionSchema,

  initialState: {
    phase: 'lobby',
    players: {},
    hostId: '',
    createdAt: Date.now(),
    settings: {
      logoSetKey: 'companies',
      listId: 'companies',
      gridSize: '6x4',
      language: 'en',
      logoCount: 24,
    },

    // Game content
    logos: [],
    isContentLoaded: false,
  },

  customReducer: guessLogoGameReducer,
});

registerGame(guessLogoGame);
