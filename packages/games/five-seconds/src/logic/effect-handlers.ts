import type { GameEffect, GameEffectContext } from '@guess-logo/game-core';
import type {
  FetchQuestionsErrorAction,
  FiveSecondsAction,
  FiveSecondsGameState,
  LoadQuestionsAction,
  SetQuestionAction,
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

export function createTimerEffect(): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;

  return async (
    ctx: GameEffectContext,
  ): Promise<StartTurnTimerAction | null> => {
    const action = ctx.action as FiveSecondsAction;
    const gameState = ctx.state as FiveSecondsGameState;
    const isServer = !!ctx.ctx?.storage;

    // Stop timer actions
    const stopTimerActions = ['START_VOTING', 'NEXT_TURN', 'END_GAME', 'RESET_GAME'];
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

    // Start timer on START_TURN
    if (action.type === 'START_TURN') {
      const turnDuration = gameState.settings.timePerTurn * 1000;
      const endsAt = Date.now() + turnDuration;
      const currentDispatch = ctx.dispatch;

      logger.info(`[TimerEffect] Starting ${turnDuration}ms timer (${isServer ? 'SERVER' : 'LOCAL'})`);

      if (isServer) {
        // Server: Use Durable Object alarm
        await ctx.ctx.storage.setAlarm(endsAt);
      }
      else {
        // Local: Use setTimeout and dispatch directly
        if (localTimerId) {
          clearTimeout(localTimerId);
        }

        localTimerId = setTimeout(async () => {
          logger.info('[TimerEffect] Local timer expired, dispatching TIMES_UP');

          if (currentDispatch) {
            await currentDispatch({ type: 'TIMES_UP' });
          }
          else {
            logger.error('[TimerEffect] No dispatch function available in local mode!');
          }

          localTimerId = undefined;
        }, turnDuration);
      }

      // Return action to update state with endsAt timestamp
      return {
        type: 'START_TURN_TIMER',
        payload: { endsAt },
      };
    }

    return null;
  };
}

export function createFiveSecondsEffects(apiUrl: string, mode: 'local' | 'multiplayer' = 'multiplayer'): GameEffect[] {
  if (mode === 'local') {
    return [createTimerEffect()];
  }
  return [createFetchQuestionsEffect(apiUrl), createTimerEffect()];
}
