import type { GameEffect, GameEffectContext } from '../contracts/game-effects';
import type { SubPhaseConfig } from './types';
import { logger } from '../utils/logger';

const PENDING_ACTION_KEY = 'sub_phase_pending_action';

export function createSubPhaseTimerEffect<TState>(
  config: SubPhaseConfig<TState>,
): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;
  let previousPhase: string | null = null;

  return async (ctx: GameEffectContext) => {
    // CRITICAL DEBUG: This should always appear when effect runs
    logger.debug(`[SubPhaseTimerEffect] ========================================`);
    logger.debug(`[SubPhaseTimerEffect] EFFECT INVOKED - action: ${ctx.action.type}`);
    logger.debug(`[SubPhaseTimerEffect] ========================================`);

    const state = ctx.state as TState;
    const currentPhase = config.getCurrentPhase(state);

    const isServer = !!ctx.ctx?.storage;

    logger.debug(`[SubPhaseTimerEffect] State - currentPhase: ${currentPhase}, previousPhase: ${previousPhase}, isServer: ${isServer}`);

    if (!currentPhase) {
      logger.debug('[SubPhaseTimerEffect] No current phase, clearing timers');
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
    logger.debug(`[SubPhaseTimerEffect] Looking for phase definition: ${currentPhase}, found: ${!!phaseDef}`);

    logger.debug(`[SubPhaseTimerEffect] Checking phase change: current=${currentPhase}, previous=${previousPhase}, changed=${currentPhase !== previousPhase}`);
    if (currentPhase !== previousPhase) {
      // Always update previousPhase to track the phase change, even if no timer is needed
      previousPhase = currentPhase;

      if (!phaseDef) {
        logger.debug(`[SubPhaseTimerEffect] No phase definition found for: ${currentPhase}, but phase tracked`);
        return null;
      }

      logger.debug(`[SubPhaseTimerEffect] Found phase definition: ${phaseDef.id}, onComplete: ${phaseDef.onComplete}`);

      // Check if this phase has a timer configuration
      // Note: Zero duration is allowed (immediate expiration), only skip negative or undefined
      if (!phaseDef.duration || phaseDef.duration(state) < 0) {
        logger.debug(`[SubPhaseTimerEffect] Phase '${currentPhase}' has no timer or negative duration, skipping timer setup`);
        return null;
      }

      const duration = phaseDef.duration(state);
      const endsAt = Date.now() + duration;

      logger.debug(`[SubPhaseTimerEffect] Phase changed! Setting timer - duration: ${duration}ms, endsAt: ${endsAt}`);

      if (isServer) {
        logger.debug(`[SubPhaseTimerEffect] 📝 Server mode - storing action: ${phaseDef.onComplete}, setting alarm for: ${endsAt}`);
        logger.debug(`[SubPhaseTimerEffect] 📝 Storage key: ${PENDING_ACTION_KEY}`);
        try {
          logger.debug(`[SubPhaseTimerEffect] 📝 About to call storage.put...`);
          await ctx.ctx.storage.put(PENDING_ACTION_KEY, phaseDef.onComplete);
          logger.debug(`[SubPhaseTimerEffect] ✅ Storage put successful for key: ${PENDING_ACTION_KEY}`);

          logger.debug(`[SubPhaseTimerEffect] 📝 About to call storage.setAlarm...`);
          await ctx.ctx.storage.setAlarm(endsAt);
          logger.debug('[SubPhaseTimerEffect] ✅ Server alarm set successfully');

          // Verify the key was stored
          const verifyValue = await ctx.ctx.storage.get(PENDING_ACTION_KEY);
          logger.debug(`[SubPhaseTimerEffect] 🔍 Verification - stored value: "${verifyValue}"`);
        }
        catch (error) {
          console.error(`[SubPhaseTimerEffect] ❌ Error setting alarm: ${error}`);
          throw error;
        }
      }
      else {
        logger.debug('[SubPhaseTimerEffect] Client mode - using setTimeout');
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

      return {
        type: 'SUB_PHASE_TIMER_STARTED',
        payload: { phase: currentPhase, endsAt },
      };
    }

    logger.debug('[SubPhaseTimerEffect] Phase unchanged, no action needed');
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
