import type { GameEffect, GameEffectContext } from '@guess-logo/game-core';
import type {
  FetchQuestionsErrorAction,
  FiveSecondsAction,
  FiveSecondsGameState,
  LoadQuestionsAction,
  SetQuestionAction,
  StartReadingTimerAction,
  StartTurnTimerAction,
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

function isErrorResponse(
  data: any,
): data is Extract<any, { code: 'NO_QUESTIONS_FOUND' }> {
  return 'code' in data && data.code === 'NO_QUESTIONS_FOUND';
}

export function createFetchQuestionsEffect(apiUrl: string): GameEffect {
  const client = hcWithType(apiUrl);
  let isFetching = false;

  return async (
    ctx: GameEffectContext,
  ): Promise<LoadQuestionsAction | SetQuestionAction | FetchQuestionsErrorAction | null> => {
    const action = ctx.action as FiveSecondsAction;
    const gameState = ctx.state as FiveSecondsGameState;
    const isServer = !!ctx.ctx?.storage;

    const triggerActions = ['FETCH_QUESTION', 'START_GAME', 'START_TURN', 'NEXT_TURN', 'TALLY_VOTES'];

    if (!triggerActions.includes(action.type)) {
      return null;
    }

    try {
      if (isServer) {
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

        if (isFetching) {
          logger.warn('[FetchQuestionsEffect] Fetch already in progress, skipping');
          return null;
        }

        try {
          isFetching = true;
          logger.info(`[FetchQuestionsEffect] Fetching ${questionsNeeded} questions from API`);

          const query = {
            count: questionsNeeded.toString(),
            categoryIds: gameState.settings.categoryIds,
            excludeIds: gameState.seenQuestionIds,
            timePerTurn: gameState.settings.timePerTurn.toString(),
            difficulty: gameState.settings.difficulty === 'all' ? undefined : gameState.settings.difficulty,
          };

          const res = await client.api.games['five-seconds'].questions.batch.$get({ query });

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
          logger.info('[FetchQuestionsEffect] Fetching single question from API');

          const query = {
            categoryIds: gameState.settings.categoryIds,
            excludeIds: gameState.seenQuestionIds,
            timePerTurn: gameState.settings.timePerTurn,
            difficulty: gameState.settings.difficulty === 'all' ? undefined : gameState.settings.difficulty,
          };

          const res = await client.api.games['five-seconds'].questions.random.$get({ query });

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

export function createTimerEffect(): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;

  return async (
    ctx: GameEffectContext,
  ): Promise<StartTurnTimerAction | StartReadingTimerAction | null> => {
    const action = ctx.action as FiveSecondsAction;
    const gameState = ctx.state as FiveSecondsGameState;
    const isServer = !!ctx.ctx?.storage;

    const stopTimerActions = ['START_VOTING', 'NEXT_TURN', 'END_GAME', 'RESET_GAME', 'TALLY_VOTES'];
    if (stopTimerActions.includes(action.type)) {
      logger.info(`[TimerEffect] Stopping timer due to: ${action.type}`);

      if (isServer) {
        await ctx.ctx.storage.deleteAlarm();
      }
      else if (localTimerId) {
        clearTimeout(localTimerId);
        localTimerId = undefined;
      }

      return null;
    }

    // Start reading timer on START_TURN
    if (action.type === 'START_TURN') {
      const readingDuration = gameState.readingTime * 1000;
      const endsAt = Date.now() + readingDuration;
      const currentDispatch = ctx.dispatch;

      logger.info(`[TimerEffect] Starting reading timer for ${readingDuration}ms (${isServer ? 'SERVER' : 'LOCAL'})`);

      if (isServer) {
        await ctx.ctx.storage.setAlarm(endsAt);
      }
      else {
        if (localTimerId) {
          clearTimeout(localTimerId);
        }

        localTimerId = setTimeout(async () => {
          logger.info('[TimerEffect] Reading timer expired, dispatching START_ANSWERING');

          if (currentDispatch) {
            await currentDispatch({ type: 'START_ANSWERING' });
          }
          else {
            logger.error('[TimerEffect] No dispatch function available in local mode!');
          }

          localTimerId = undefined;
        }, readingDuration);
      }

      return {
        type: 'START_READING_TIMER',
        payload: { endsAt },
      };
    }

    // Start answering timer on START_ANSWERING
    if (action.type === 'START_ANSWERING') {
      const turnDuration = gameState.settings.timePerTurn * 1000;
      const endsAt = Date.now() + turnDuration;
      const currentDispatch = ctx.dispatch;

      logger.info(`[TimerEffect] Starting answering timer for ${turnDuration}ms (${isServer ? 'SERVER' : 'LOCAL'})`);

      if (isServer) {
        await ctx.ctx.storage.setAlarm(endsAt);
      }
      else {
        if (localTimerId) {
          clearTimeout(localTimerId);
        }

        localTimerId = setTimeout(async () => {
          logger.info('[TimerEffect] Answering timer expired, dispatching TIMES_UP');

          if (currentDispatch) {
            await currentDispatch({ type: 'TIMES_UP' });
          }
          else {
            logger.error('[TimerEffect] No dispatch function available in local mode!');
          }

          localTimerId = undefined;
        }, turnDuration);
      }

      return {
        type: 'START_TURN_TIMER',
        payload: { endsAt },
      };
    }

    return null;
  };
}

export function createFiveSecondsEffects(apiUrl: string): GameEffect[] {
  return [createFetchQuestionsEffect(apiUrl), createTimerEffect()];
}
