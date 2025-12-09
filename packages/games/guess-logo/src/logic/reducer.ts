import type { Draft } from 'immer';
import type { GuessLogoAction, GuessLogoGameState } from './schema';
import { produce } from 'immer';
import {
  checkWinner,
  eliminateLogo,
  loadContent,
  restoreLogo,
  shuffleLogos,
} from './actions';

export function guessLogoGameReducer(
  state: GuessLogoGameState,
  action: GuessLogoAction,
): GuessLogoGameState {
  return produce(state, (draft: Draft<GuessLogoGameState>) => {
    switch (action.type) {
      case 'LOAD_CONTENT':
        loadContent(draft, action.payload);
        break;
      case 'ELIMINATE_LOGO':
        eliminateLogo(draft, action.payload);
        break;
      case 'RESTORE_LOGO':
        restoreLogo(draft, action.payload);
        break;
      case 'CHECK_WINNER':
        checkWinner(draft, action.payload);
        break;
      case 'SHUFFLE_LOGOS':
        shuffleLogos(draft, action.payload);
        break;
    }
  });
}
