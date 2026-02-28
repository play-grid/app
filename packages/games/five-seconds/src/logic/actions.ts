import type { Draft } from 'immer';
import type {
  AddSeenQuestionIdAction,
  FiveSecondsGameState,
  LoadQuestionsAction,
  SetGameTurnPhaseAction,
  SetQuestionAction,
  StartReadingTimerAction,
  StartTurnTimerAction,
  StartVotingAction,
  SubmitVoteAction,
  TallyVotesAction,
} from './schema';
import { logger } from '../logger';

const MAX_SEEN_QUESTIONS = 400;

function capSeenQuestions(ids: string[]): void {
  if (ids.length > MAX_SEEN_QUESTIONS) {
    const toRemove = ids.length - MAX_SEEN_QUESTIONS;
    ids.splice(0, toRemove);
    logger.debug(`[FiveSeconds] Seen questions capped at ${MAX_SEEN_QUESTIONS} (removed ${toRemove} oldest)`);
  }
}

export function addSeenQuestionId(
  draft: Draft<FiveSecondsGameState>,
  payload: AddSeenQuestionIdAction['payload'],
): void {
  draft.seenQuestionIds.push(payload.id);
  capSeenQuestions(draft.seenQuestionIds);
}

export function setQuestion(
  draft: Draft<FiveSecondsGameState>,
  payload: SetQuestionAction['payload'],
): void {
  draft.currentQuestion = payload.question;
  if (!draft.seenQuestionIds.includes(payload.question.id)) {
    draft.seenQuestionIds.push(payload.question.id);
    capSeenQuestions(draft.seenQuestionIds);
  }
  logger.debug(`[FiveSeconds] Current question set: ${payload.question.id} - "${payload.question.text}"`);
}

export function loadQuestions(
  draft: Draft<FiveSecondsGameState>,
  payload: LoadQuestionsAction['payload'],
): void {
  draft.questions.push(...payload.questions);

  if (!draft.currentQuestion && payload.questions.length > 0) {
    draft.currentQuestion = payload.questions[0];

    if (!draft.seenQuestionIds.includes(payload.questions[0].id)) {
      draft.seenQuestionIds.push(payload.questions[0].id);
      capSeenQuestions(draft.seenQuestionIds);
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
  draft.turnTimerEndsAt = null;
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

  const { turnState } = draft;
  if (!turnState)
    return;

  const { playerOrder, currentPlayerIndex } = turnState;
  if (playerOrder.length === 0)
    return;

  const nextIndex = (currentPlayerIndex + 1) % playerOrder.length;

  turnState.currentPlayerIndex = nextIndex;
  turnState.currentPlayerId = playerOrder[nextIndex];

  const newPlayer = draft.players[playerOrder[nextIndex]];
  logger.debug(`[FiveSeconds] Turn moved to player: ${playerOrder[nextIndex]} (${newPlayer?.name || 'Unknown'})`);

  if (nextIndex === 0) {
    turnState.roundNumber += 1;
  }

  turnState.turnNumber += 1;
  turnState.phase = 'pre-turn';

  draft.currentQuestion = null;
  draft.turnTimerEndsAt = null;
}

export function startTurn(draft: Draft<FiveSecondsGameState>): void {
  if (!draft.turnState) {
    return;
  }

  const currentPlayerId = draft.turnState.currentPlayerId;
  const currentPlayer = draft.players[currentPlayerId];

  if (currentPlayer) {
    draft.turnState.phase = 'reading';

    if (draft.currentQuestion) {
      const charsPerSecond = 10;
      const readingTime = Math.max(2, Math.ceil(draft.currentQuestion.text.length / charsPerSecond));
      draft.readingTime = readingTime;
      draft.readingTimerEndsAt = null;
      draft.turnTimerEndsAt = null;
      logger.debug(`[FiveSeconds] Turn started for player: ${currentPlayerId} (${currentPlayer.name}), reading time: ${readingTime}s`);
    }
    else {
      draft.readingTime = 2;
      draft.readingTimerEndsAt = null;
      logger.debug(`[FiveSeconds] Turn started for player: ${currentPlayerId} (${currentPlayer.name}), no question found`);
    }
  }
}

export function startAnswering(draft: Draft<FiveSecondsGameState>): void {
  if (!draft.turnState) {
    return;
  }

  const currentPlayerId = draft.turnState.currentPlayerId;
  const currentPlayer = draft.players[currentPlayerId];

  if (currentPlayer) {
    draft.turnState.phase = 'answering';
    draft.readingTimerEndsAt = null;
    logger.debug(`[FiveSeconds] Answering phase started for player: ${currentPlayerId} (${currentPlayer.name})`);
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

/**
 * FIX: This should rarely be called directly now
 */
export function nextTurn(draft: Draft<FiveSecondsGameState>): void {
  const { turnState } = draft;
  if (!turnState)
    return;

  const { playerOrder, currentPlayerIndex } = turnState;
  if (playerOrder.length === 0)
    return;

  const nextIndex = (currentPlayerIndex + 1) % playerOrder.length;

  turnState.currentPlayerIndex = nextIndex;
  turnState.currentPlayerId = playerOrder[nextIndex];

  const newPlayer = draft.players[playerOrder[nextIndex]];
  logger.debug(`[FiveSeconds] Turn moved to player: ${playerOrder[nextIndex]} (${newPlayer?.name || 'Unknown'})`);

  if (nextIndex === 0) {
    turnState.roundNumber += 1;
  }

  turnState.turnNumber += 1;
  turnState.phase = 'pre-turn';

  draft.currentQuestion = null;
  draft.turnTimerEndsAt = null;
  draft.readingTime = 0;
  draft.readingTimerEndsAt = null;
}

export function startTurnTimer(
  draft: Draft<FiveSecondsGameState>,
  payload: StartTurnTimerAction['payload'],
): void {
  draft.turnTimerEndsAt = payload.endsAt;
}

export function startReadingTimer(
  draft: Draft<FiveSecondsGameState>,
  payload: StartReadingTimerAction['payload'],
): void {
  draft.readingTimerEndsAt = payload.endsAt;
}

export function timesUp(draft: Draft<FiveSecondsGameState>): void {
  if (draft.turnState?.phase !== 'answering') {
    return;
  }

  const voterIds = Object.keys(draft.players).filter(
    pId => pId !== draft.turnState?.currentPlayerId,
  );

  startVoting(draft, { voters: voterIds });
}

export function clearEphemeralState(draft: Draft<FiveSecondsGameState>): void {
  draft.currentQuestion = null;
  draft.questions = [];
  draft.questionError = null;
  draft.turnState = undefined;
  draft.turnTimerEndsAt = null;
  draft.readingTime = 0;
  draft.readingTimerEndsAt = null;
  draft.votingState = null;
}

export function clearQuestionError(draft: Draft<FiveSecondsGameState>): void {
  draft.questionError = null;
}
