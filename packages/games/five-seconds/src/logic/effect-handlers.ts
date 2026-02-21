import type { GameEffect, GameEffectContext } from '@guess-logo/game-core';
import type {
  FetchQuestionsErrorAction,
  FiveSecondsAction,
  FiveSecondsGameState,
  LoadQuestionsAction,
  SetQuestionAction,
} from './schema';
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

function isErrorResponse(
  data: any,
): data is Extract<any, { code: 'NO_QUESTIONS_FOUND' }> {
  return 'code' in data && data.code === 'NO_QUESTIONS_FOUND';
}

export function createFetchQuestionsEffect(): GameEffect {
  let isFetching = false;

  return async (
    ctx: GameEffectContext,
  ): Promise<LoadQuestionsAction | SetQuestionAction | FetchQuestionsErrorAction | null> => {
    const action = ctx.action as FiveSecondsAction;
    const gameState = ctx.state as FiveSecondsGameState;
    const isServer = !!ctx.ctx?.storage;

    // logger.debug(`[FetchQuestionsEffect] ========================================`);
    // logger.debug(`[FetchQuestionsEffect] ACTION: ${action.type}`);
    // logger.debug(`[FetchQuestionsEffect] Phase: ${gameState.phase}, TurnPhase: ${gameState.turnState?.phase}`);
    // logger.debug(`[FetchQuestionsEffect] Has currentQuestion: ${!!gameState.currentQuestion}`);
    // logger.debug(`[FetchQuestionsEffect] Buffer size: ${gameState.questions.length}`);
    // logger.debug(`[FetchQuestionsEffect] isFetching: ${isFetching}`);
    // logger.debug(`[FetchQuestionsEffect] ========================================`);

    // if (gameState.phase === 'results' || gameState.phase === 'lobby') {
    //   logger.debug(`[FetchQuestionsEffect] Skipping - game in ${gameState.phase} phase`);
    //   return null;
    // }

    // FIX: Don't trigger on FETCH_QUESTION itself to prevent infinite loop
    const triggerActions = ['START_GAME', 'START_TURN', 'NEXT_TURN', 'TALLY_VOTES'];

    if (!triggerActions.includes(action.type)) {
      return null;
    }

    try {
      if (isServer) {
        if (!gameState.currentQuestion) {
          const nextQuestion = getNextUnseenQuestion(gameState);
          if (nextQuestion) {
            logger.debug(`[FetchQuestionsEffect] Current question missing, pulling from buffer: ${nextQuestion.id}`);
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

        if (isFetching) {
          logger.warn('[FetchQuestionsEffect] Fetch already in progress, skipping');
          return null;
        }

        try {
          isFetching = true;
          logger.debug(`[FetchQuestionsEffect] Fetching ${questionsNeeded} questions from API`);

          const query = {
            count: questionsNeeded.toString(),
            categoryIds: gameState.settings.categoryIds,
            excludeIds: gameState.seenQuestionIds,
            timePerTurn: gameState.settings.timePerTurn.toString(),
            difficulty: gameState.settings.difficulty === 'all' ? undefined : gameState.settings.difficulty,
          };

          const url = new URL(`/api/games/five-seconds/questions/batch`, ctx.apiUrl || window.location.origin);
          Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
              if (Array.isArray(value)) {
                url.searchParams.set(key, value.join(','));
              }
              else {
                url.searchParams.set(key, String(value));
              }
            }
          });
          const res = await fetch(url.toString());

          if (!res.ok) {
            const errorText = await res.text().catch(() => `HTTP ${res.status}`);
            logger.error(`[FetchQuestionsEffect] API error: ${res.status} - ${errorText}`);

            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: 'Unable to load questions from server. Please check your connection and try again.',
                canRetry: true,
                suggestSettingsChange: false,
              },
            };
          }

          const data = await res.json();

          if (!data.questions || data.questions.length === 0) {
            logger.warn('[FetchQuestionsEffect] No questions available matching current filters');
            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: 'No questions available with the current settings. Try changing difficulty or categories.',
                canRetry: true,
                suggestSettingsChange: true,
              },
            };
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
        finally {
          isFetching = false;
        }
      }
      else {
        // For local mode with custom questions, skip API fetch (handled by useQuestion hook)
        if (gameState.settings.useCustomQuestions) {
          return null;
        }

        if (gameState.currentQuestion) {
          return null;
        }

        if (isFetching) {
          logger.warn('[FetchQuestionsEffect] Fetch already in progress, skipping');
          return null;
        }

        try {
          isFetching = true;
          logger.debug('[FetchQuestionsEffect] Fetching single question from API');

          const query = {
            categoryIds: gameState.settings.categoryIds,
            excludeIds: gameState.seenQuestionIds,
            timePerTurn: gameState.settings.timePerTurn,
            difficulty: gameState.settings.difficulty === 'all' ? undefined : gameState.settings.difficulty,
          };

          const url = new URL(`/api/games/five-seconds/questions/random`, ctx.apiUrl || window.location.origin);
          Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
              if (Array.isArray(value)) {
                url.searchParams.set(key, value.join(','));
              }
              else {
                url.searchParams.set(key, String(value));
              }
            }
          });
          const res = await fetch(url.toString());

          if (!res.ok) {
            const errorText = await res.text().catch(() => `HTTP ${res.status}`);
            logger.error(`[FetchQuestionsEffect] API error: ${res.status} - ${errorText}`);

            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: 'Unable to load questions from server. Please check your connection and try again.',
                canRetry: true,
                suggestSettingsChange: false,
              },
            };
          }

          const data = await res.json();

          if (isErrorResponse(data)) {
            logger.warn('[FetchQuestionsEffect] No questions available matching current filters');
            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: (data as any).message,
                canRetry: true,
                suggestSettingsChange: true,
              },
            };
          }

          const questionData = data as any;
          const question = {
            id: questionData.id,
            text: questionData.text,
            difficulty: questionData.difficulty,
            categoryId: questionData.categoryId,
          };

          return {
            type: 'SET_QUESTION',
            payload: { question },
          };
        }
        finally {
          isFetching = false;
        }
      }
    }
    catch (error) {
      isFetching = false;
      logger.error('[FetchQuestionsEffect] Unexpected error:', error);
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');

      return {
        type: 'FETCH_QUESTIONS_ERROR',
        payload: {
          message: isNetworkError
            ? 'Network connection failed. Please check your internet connection and try again.'
            : 'An unexpected error occurred while loading questions. Please try again.',
          canRetry: true,
          suggestSettingsChange: false,
        },
      };
    }
  };
}

export function createFiveSecondsEffects(): GameEffect[] {
  return [createFetchQuestionsEffect()];
}
