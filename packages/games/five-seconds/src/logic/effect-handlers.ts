import type { GameEffect, GameEffectContext } from '@guess-logo/game-core';
import type {
  FetchQuestionsErrorAction,
  FiveSecondsAction,
  FiveSecondsGameState,
  LoadQuestionsAction,
  SetQuestionAction,
} from './schema';
import hcWithType from '@guess-logo/api-client';
import { logger } from '../logger';

function getQuestionsNeeded(state: FiveSecondsGameState): number {
  const currentBuffered = state.questions.length;
  const minBuffer = 5;
  const maxBatch = 9;

  return currentBuffered >= minBuffer ? 0 : maxBatch;
}

function getNextUnseenQuestion(state: FiveSecondsGameState) {
  return state.questions.find(q => !state.seenQuestionIds.includes(q.id));
}

export function createFetchQuestionsEffect(apiUrl: string): GameEffect {
  const client = hcWithType(apiUrl);

  return async (
    ctx: GameEffectContext,
  ): Promise<LoadQuestionsAction | SetQuestionAction | FetchQuestionsErrorAction | null> => {
    const action = ctx.action as FiveSecondsAction;
    const gameState = ctx.state as FiveSecondsGameState;

    const triggerActions = ['FETCH_QUESTION', 'START_GAME', 'START_TURN', 'NEXT_TURN'];

    if (!triggerActions.includes(action.type)) {
      return null;
    }

    try {
      if (!gameState.currentQuestion) {
        const nextQuestion = getNextUnseenQuestion(gameState);
        if (nextQuestion) {
          logger.info(`[FetchQuestionsEffect] Current question missing, pulling from buffer: ${nextQuestion.id}`);
          return {
            type: 'SET_QUESTION',
            payload: { question: nextQuestion },
          };
        }
      }

      const questionsNeeded = getQuestionsNeeded(gameState);

      if (questionsNeeded === 0) {
        return null;
      }

      logger.info(`[FetchQuestionsEffect] Fetching ${questionsNeeded} questions from API`);

      const res = await client.api.games['five-seconds'].questions.batch.$get({
        query: {
          count: questionsNeeded.toString(),
          categoryIds: gameState.settings.categoryIds,
          difficulty: gameState.settings.difficulty,
          excludeIds: gameState.seenQuestionIds,
          timePerTurn: gameState.settings.timePerTurn.toString(),
        },
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions available');
      }

      return {
        type: 'LOAD_QUESTIONS',
        payload: {
          questions: data.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            difficulty: q.difficulty,
            categoryId: q.categoryId,
          })),
        },
      };
    }
    catch (error) {
      logger.error('[FetchQuestionsEffect] Error:', error);

      return {
        type: 'FETCH_QUESTIONS_ERROR',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  };
}

export function createFiveSecondsEffects(apiUrl: string): GameEffect[] {
  return [createFetchQuestionsEffect(apiUrl)];
}
