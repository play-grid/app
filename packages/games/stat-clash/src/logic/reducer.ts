import type { StatClashAction, StatClashGameState } from './schema';
import { produce } from 'immer';
import {
  addHotseatPlayer,
  guessHigher,
  handleStatItemsFetched,
  removeHotseatPlayer,
  setError,
  startGame,
} from './actions';

export function statClashReducer(
  state: StatClashGameState,
  action: StatClashAction,
): StatClashGameState {
  return produce(state, (draft) => {
    draft.lastActivityAt = Date.now();

    switch (action.type) {
      case 'START_GAME':
        startGame(draft, action.payload as any);
        break;

      case 'STAT_ITEMS_FETCHED':
        handleStatItemsFetched(draft, action.payload);
        break;

      case 'GUESS_HIGHER':
        guessHigher(draft, action.payload);
        break;

      case 'STAT_CLASH_ERROR':
        setError(draft, action.payload);
        break;

      case 'ADD_HOTSEAT_PLAYER':
        addHotseatPlayer(draft, action.payload);
        break;

      case 'REMOVE_HOTSEAT_PLAYER':
        removeHotseatPlayer(draft, action.payload);
        break;

      default:
        break;
    }
  });
}
