import type { Draft } from 'immer';
import type {
  AddSeenQuestionIdAction,
  FiveSecondsGameState,
  LoadQuestionsAction,
  SetGameTurnPhaseAction,
  SetQuestionAction,
  StartVotingAction,
  SubmitVoteAction,
  TallyVotesAction,
} from './schema';

export function addSeenQuestionId(
  draft: Draft<FiveSecondsGameState>,
  payload: AddSeenQuestionIdAction['payload'],
): void {
  draft.seenQuestionIds.push(payload.id);
}

export function setQuestion(
  draft: Draft<FiveSecondsGameState>,
  payload: SetQuestionAction['payload'],
): void {
  draft.currentQuestion = payload.question;
  if (!draft.seenQuestionIds.includes(payload.question.id)) {
    draft.seenQuestionIds.push(payload.question.id);
  }
}

export function loadQuestions(
  draft: Draft<FiveSecondsGameState>,
  payload: LoadQuestionsAction['payload'],
): void {
  // Add questions to buffer
  draft.questions.push(...payload.questions);

  if (!draft.currentQuestion && payload.questions.length > 0) {
    draft.currentQuestion = payload.questions[0];
    // Add to seen IDs
    if (!draft.seenQuestionIds.includes(payload.questions[0].id)) {
      draft.seenQuestionIds.push(payload.questions[0].id);
    }
  }
}

export function startVoting(
  draft: Draft<FiveSecondsGameState>,
  payload: StartVotingAction['payload'],
): void {
  if (draft.turnState) {
    draft.turnState.phase = 'voting';
  }

  draft.votingState = {
    isVoting: true,
    votes: [],
    voters: payload.voters,
    currentVoterIndex: 0,
  };
}

export function submitVote(
  draft: Draft<FiveSecondsGameState>,
  payload: SubmitVoteAction['payload'],
): void {
  if (draft.votingState?.isVoting) {
    const currentVoterId
      = draft.votingState.voters[draft.votingState.currentVoterIndex];
    if (currentVoterId) {
      draft.votingState.votes.push({
        playerId: currentVoterId,
        isValid: payload.isValid,
      });
      draft.votingState.currentVoterIndex += 1;
    }
  }
}

export function resetVoting(draft: Draft<FiveSecondsGameState>): void {
  draft.votingState = null;
}

export function tallyVotes(
  draft: Draft<FiveSecondsGameState>,
  payload: TallyVotesAction['payload'],
): void {
  if (!draft.votingState) {
    return;
  }

  const validVotes = draft.votingState.votes.filter(v => v.isValid).length;
  const invalidVotes = draft.votingState.votes.length - validVotes;

  if (validVotes > invalidVotes) {
    const player = draft.players[payload.currentPlayerId];
    if (player) {
      player.score += 1;
    }
  }

  draft.votingState = null;
}

export function startTurn(draft: Draft<FiveSecondsGameState>): void {
  if (!draft.turnState) {
    return;
  }

  const currentPlayerId = draft.turnState.currentPlayerId;
  const currentPlayer = draft.players[currentPlayerId];

  if (currentPlayer) {
    draft.turnState.phase = 'answering';
  }
}

export function setTurnPhase(
  draft: Draft<FiveSecondsGameState>,
  payload: SetGameTurnPhaseAction['payload'],
): void {
  if (draft.turnState) {
    draft.turnState.phase = payload.phase;
  }
}

export function nextTurn(draft: Draft<FiveSecondsGameState>): void {
  const { turnState } = draft;
  if (!turnState)
    return;

  const { playerOrder, currentPlayerIndex } = turnState;
  const nextIndex = (currentPlayerIndex + 1) % playerOrder.length;

  turnState.currentPlayerIndex = nextIndex;
  turnState.currentPlayerId = playerOrder[nextIndex];

  if (nextIndex === 0) {
    turnState.roundNumber += 1;
  }
  turnState.turnNumber += 1;
  turnState.phase = 'pre-turn';

  draft.currentQuestion = null;
}
