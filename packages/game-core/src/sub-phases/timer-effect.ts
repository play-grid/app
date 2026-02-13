import type { GameEffect, GameEffectContext } from '../contracts/game-effects';
import type { SubPhaseConfig } from './types';

const PENDING_ACTION_KEY = 'sub_phase_pending_action';

export function createSubPhaseTimerEffect<TState>(
  config: SubPhaseConfig<TState>,
): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;
  let previousPhase: string | null = null;

  return async (ctx: GameEffectContext) => {
    const state = ctx.state as TState;
    const currentPhase = config.getCurrentPhase(state);

    const isServer = !!ctx.ctx?.storage;

    if (!currentPhase) {
      previousPhase = null;

      if (isServer) {
        await ctx.ctx.storage.deleteAlarm();
      }
      else if (localTimerId) {
        clearTimeout(localTimerId);
        localTimerId = undefined;
      }

      return null;
    }

    const phaseDef = config.phases.find(p => p.id === currentPhase);
    if (!phaseDef)
      return null;

    if (currentPhase !== previousPhase) {
      const duration = phaseDef.duration(state);
      const endsAt = Date.now() + duration;

      if (isServer) {
        await ctx.ctx.storage.put(PENDING_ACTION_KEY, phaseDef.onComplete);
        await ctx.ctx.storage.setAlarm(endsAt);
      }
      else {
        if (localTimerId) {
          clearTimeout(localTimerId);
        }

        localTimerId = setTimeout(async () => {
          if (ctx.dispatch) {
            await ctx.dispatch({ type: phaseDef.onComplete });
          }
          localTimerId = undefined;
        }, duration);
      }

      previousPhase = currentPhase;

      return {
        type: 'SUB_PHASE_TIMER_STARTED',
        payload: { phase: currentPhase, endsAt },
      };
    }

    return null;
  };
}
/**
 * Helper to stop local timer when needed
 */
export function createSubPhaseCleanupEffect(): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;

  return async (ctx: GameEffectContext) => {
    const isServer = !!ctx.ctx?.storage;
    // Only cleanup in local mode
    if (!isServer && localTimerId) {
      clearTimeout(localTimerId);
      localTimerId = undefined;
    }

    return null;
  };
}
