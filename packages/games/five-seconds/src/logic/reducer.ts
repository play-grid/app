import type { FiveSecondsAction, FiveSecondsGameState } from './schema';
import { produce } from 'immer';
import {
  addSeenQuestionId,
  loadQuestions,
  nextTurn,
  resetVoting,
  setQuestion,
  setTurnPhase,
  startTurn,
  startVoting,
  submitVote,
  tallyVotes,
} from './actions';

export function fiveSecondsGameReducer(
  state: FiveSecondsGameState,
  action: FiveSecondsAction,
): FiveSecondsGameState {
  switch (action.type) {
    case 'ADD_SEEN_QUESTION_ID':
      return produce(state, (draft) => {
        addSeenQuestionId(draft, action.payload);
      });

    case 'SET_QUESTION':
      return produce(state, (draft) => {
        setQuestion(draft, action.payload);
      });

    case 'NEXT_TURN':
      return produce(state, (draft) => {
        nextTurn(draft);
      });

    case 'LOAD_QUESTIONS':
      return produce(state, (draft) => {
        loadQuestions(draft, action.payload);
      });

    case 'START_TURN':
      return produce(state, (draft) => {
        startTurn(draft);
      });
    case 'SET_GAME_TURN_PHASE':
      return produce(state, (draft) => {
        setTurnPhase(draft, action.payload);
      });
    case 'START_VOTING':
      return produce(state, (draft) => {
        startVoting(draft, action.payload);
      });

    case 'SUBMIT_VOTE':
      return produce(state, (draft) => {
        submitVote(draft, action.payload);
      });

    case 'RESET_VOTING':
      return produce(state, (draft) => {
        resetVoting(draft);
      });

    case 'TALLY_VOTES':
      return produce(state, (draft) => {
        tallyVotes(draft, action.payload);
      });

    default:
      return state;
  }
}
