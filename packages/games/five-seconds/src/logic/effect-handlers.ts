import type { GameEffect, GameEffectContext } from '@guess-logo/game-core';
import type { FetchQuestionsErrorAction, FiveSecondsAction, FiveSecondsGameState, LoadQuestionsAction } from './schema';
import hcWithType from '@guess-logo/api-client';
import { logger } from '../logger';

/**
 * Determine how many questions are needed based on current state
 */
function getQuestionsNeeded(state: FiveSecondsGameState): number {
  const currentQuestions = state.questions?.length || 0;
  const questionsPerRound = 3;
  const minBuffer = 5;

  if (currentQuestions < minBuffer) {
    return questionsPerRound * 3;
  }

  return 0;
}

/**
 * Effect that fetches questions using Hono RPC client
 */
export function createFetchQuestionsEffect(apiUrl: string): GameEffect {
  const client = hcWithType(apiUrl);

  return async (ctx: GameEffectContext): Promise<LoadQuestionsAction | FetchQuestionsErrorAction | null> => {
    const action = ctx.action as FiveSecondsAction;

    // Only trigger on specific actions
    if (action.type !== 'NEXT_ROUND' && action.type !== 'START_GAME' && action.type !== 'FETCH_QUESTION') {
      return null;
    }

    try {
      const gameState = ctx.state as FiveSecondsGameState;

      const questionsNeeded = getQuestionsNeeded(gameState);

      if (questionsNeeded === 0) {
        return null;
      }

      logger.info(`Fetching ${questionsNeeded} questions via RPC`);

      const res = await client.api.games['five-seconds'].questions.batch.$get({
        query: {
          count: questionsNeeded.toString(),
          categoryIds: gameState.settings.categoryIds,
          difficulty: gameState.settings.difficulty,
          excludeIds: gameState.seenQuestionIds,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch questions: ${res.statusText}`);
      }

      const data = await res.json();

      logger.info(`Fetched ${data.questions.length} questions`);

      // Return strongly typed action
      const loadQuestionsAction: LoadQuestionsAction = {
        type: 'LOAD_QUESTIONS',
        payload: {
          questions: data.questions.map(q => ({
            id: q.id,
            question: q.question,
            categoryId: q.categoryId,
            difficulty: q.difficulty,
          })),
        },
      };

      return loadQuestionsAction;
    }
    catch (error) {
      logger.error('Error fetching questions:', error);

      const errorAction: FetchQuestionsErrorAction = {
        type: 'FETCH_QUESTIONS_ERROR',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };

      return errorAction;
    }
  };
}

/**
 * Factory function for game registration
 */
export function createFiveSecondsEffects(apiUrl: string): GameEffect[] {
  return [
    createFetchQuestionsEffect(apiUrl),
  ];
}
