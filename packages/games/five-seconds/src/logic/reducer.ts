import type { FiveSecondsAction, FiveSecondsGameState } from './schema';
import { gameReducer as coreGameReducer } from '@guess-logo/game-core/game-logic/reducer';
import { produce } from 'immer';
import {
  addSeenQuestionId,
  resetVoting,
  startVoting,
  submitVote,
  tallyVotes,
} from './actions';

export function fiveSecondsReducer(
  state: FiveSecondsGameState,
  action: FiveSecondsAction,
): FiveSecondsGameState {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'ADD_SEEN_QUESTION_ID':
        addSeenQuestionId(draft, action.payload);
        break;
      case 'START_VOTING':
        startVoting(draft, action.payload);
        break;
      case 'SUBMIT_VOTE':
        submitVote(draft, action.payload);
        break;
      case 'RESET_VOTING':
        resetVoting(draft);
        break;
      case 'TALLY_VOTES':
        tallyVotes(draft);
        break;
      default: {
        const nextCoreState = coreGameReducer(
          draft as Parameters<typeof coreGameReducer>[0],
          action as Parameters<typeof coreGameReducer>[1],
        );
        Object.assign(draft, nextCoreState);
        break;
      }
    }
  });
}
