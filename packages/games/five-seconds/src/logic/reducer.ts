import type { FiveSecondsAction, FiveSecondsGameState } from './schema';
import { produce } from 'immer';
import {
  addSeenQuestionId,
  clearEphemeralState,
  clearQuestionError,
  loadQuestions,
  nextTurn,
  resetVoting,
  setQuestion,
  setTurnPhase,
  startTurn,
  startTurnTimer,
  startVoting,
  submitVote,
  tallyVotes,
  timesUp,
} from './actions';

export function fiveSecondsGameReducer(
  state: FiveSecondsGameState,
  action: FiveSecondsAction,
): FiveSecondsGameState {
  switch (action.type) {
    case 'START_GAME':
      return produce(state, clearEphemeralState);

    case 'END_GAME':
      return produce(state, clearEphemeralState);

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
        clearQuestionError(draft);
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

    case 'START_TURN_TIMER':
      return produce(state, (draft) => {
        startTurnTimer(draft, action.payload);
      });

    case 'TIMES_UP':
      return produce(state, (draft) => {
        timesUp(draft);
      });

    case 'FETCH_QUESTIONS_ERROR':
      return produce(state, (draft) => {
        draft.questionError = action.payload;
        draft.currentQuestion = null;
      });

    case 'CLEAR_QUESTION_ERROR':
      return produce(state, clearQuestionError);

    case 'UPDATE_SETTINGS':
      return produce(state, (draft) => {
        draft.settings = {
          ...draft.settings,
          ...action.payload,
        };
        clearQuestionError(draft);
      });

    case 'SET_PHASE':
      if (action.payload === 'lobby') {
        return produce(state, (draft) => {
          draft.phase = 'lobby';
          clearEphemeralState(draft);
        });
      }
      if (action.payload === 'results') {
        return produce(state, (draft) => {
          draft.phase = 'results';
          clearEphemeralState(draft);
        });
      }
      return state;

    default:
      return state;
  }
}
