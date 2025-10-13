import type { FiveSecondsGameSettings, FiveSecondsPlayer } from './types';
import { createGameStore } from '@guess-logo/game-core/stores';
import { CATEGORIES, DIFFICULTIES } from './types';

const initialSettings: FiveSecondsGameSettings = {
  categories: [CATEGORIES[0]],
  difficulty: DIFFICULTIES[0],
  timePerTurn: 5,
};

export const useFiveSecondsStore = createGameStore<FiveSecondsGameSettings, FiveSecondsPlayer>({
  name: 'five-seconds-game',
  initialSettings,
  options: {
    maxPlayers: 4,
    minPlayers: 2,
    turnBased: true,
    requireReady: true,
  },
});
