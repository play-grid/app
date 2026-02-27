import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { createStatClashEffects } from './logic/effect-handlers';
import { createInitialState } from './logic/initial-state';
import { statClashReducer } from './logic/reducer';
import { StatClashActionSchema, StatClashGameStateSchema } from './logic/schema';
import { validateStatClashAction } from './logic/validator';

export const statClashGame = createGameDefinition({
  meta: {
    id: 'stat-clash',
    version: '1.0.0',
    name: { en: 'Stat Clash', ar: 'لعبه الارقام' },
    description: {
      en: 'Guess which item has higher value. Play solo, with friends on one screen, or remotely!',
      ar: 'خمّن أي عنصر له قيمة أعلى. العب وحدك أو مع أصدقائك!',
    },
    imageUrl: '/assets/games/stat-clash/thumbnail.jpg',
    minPlayers: 1,
    maxPlayers: 8,
  },
  stateSchema: StatClashGameStateSchema,
  actionSchema: StatClashActionSchema,
  initialState: createInitialState('', '', 'solo'),
  validator: validateStatClashAction,
  customReducer: statClashReducer,
});

registerGame(statClashGame, (apiUrl) => createStatClashEffects(apiUrl));
