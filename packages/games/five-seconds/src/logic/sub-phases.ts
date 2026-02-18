import type { SubPhaseConfig } from '@guess-logo/game-core';
import type { FiveSecondsGameState } from './schema';

export const fiveSecondsSubPhases: SubPhaseConfig<FiveSecondsGameState> = {
  phases: [
    {
      id: 'reading',
      duration: (state) => {
        if (!state.currentQuestion)
          return 2000;
        return Math.max(2000, Math.ceil(state.currentQuestion.text.length / 10) * 1000);
      },
      onComplete: 'START_ANSWERING',
    },
    {
      id: 'answering',
      duration: state => state.settings.timePerTurn * 1000,
      onComplete: 'TIMES_UP',
    },
  ],
  getCurrentPhase: state => state.turnState?.phase || null,
};
