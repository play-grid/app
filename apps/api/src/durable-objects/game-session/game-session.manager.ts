// apps/api/src/durable-objects/game-session/game-session.manager.ts

import type { BaseGameState, GameDefinition, GameEffect } from '@playgrid/game-core';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

export interface GameSessionManagerConfig {
  gameDefinition: GameDefinition<any, any>;
  initialState: BaseGameState;
  ctx: DurableObjectState;
  effectHandlers?: GameEffect[];
  apiUrl?: string;
}

const MAX_DISPATCH_DEPTH = 10;

/**
 * GameSessionManager - The authoritative state machine for multiplayer games
 *
 * Responsibilities:
 * 1. Maintain the current game state
 * 2. Validate and execute actions through the pure reducer
 * 3. Execute side effects via registered effect functions
 * 4. Persist state to durable storage
 * 5. Broadcast state updates to all connected clients
 *
 * Flow:
 * Action → Validate → Pure Reducer → New State → Save → Broadcast → Effects → (Optional Follow-up Action)
 */
export class GameSessionManager {
  private currentState: BaseGameState;
  private gameDefinition: GameDefinition<any, any>;
  private ctx: DurableObjectState;
  private effectHandlers: GameEffect[];
  private apiUrl: string;

  constructor(config: GameSessionManagerConfig) {
    try {
      const initialState = config.initialState;
      this.currentState = config.gameDefinition.stateSchema.parse(
        initialState,
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionManager] Initial state validation failed:');
      throw error;
    }

    this.gameDefinition = config.gameDefinition;
    this.ctx = config.ctx;
    this.effectHandlers = config.effectHandlers || [];
    this.apiUrl = config.apiUrl || '';

    logger.debug(`[GameSessionManager] Initialized with ${this.effectHandlers.length} effect(s)`);
  }

  getState(): BaseGameState {
    return this.currentState;
  }

  /**
   * Dispatch an action through the state machine
   *
   * Flow:
   * 1. Validate action against schema
   * 2. Run pure reducer to get new state
   * 3. Validate new state
   * 4. Persist to storage
   * 5. Broadcast to all clients
   * 6. Run effect functions (which may dispatch follow-up actions)
   *
   * @throws Error if validation fails or state is invalid
   */
  async dispatchAction(action: any, playerId?: string, depth = 0): Promise<void> {
    if (depth > MAX_DISPATCH_DEPTH) {
      throw new Error('Max dispatch depth exceeded, possible infinite loop');
    }

    logger.debug(`[GameSessionManager] Dispatching action: ${action?.type} (depth: ${depth})`);
    logger.debug({ action }, '[GameSessionManager] Action payload (raw):');

    // Validate the action
    const validatedAction = this.validateAction(action);
    logger.debug(validatedAction, '[GameSessionManager] Action payload (validated and parsed):');

    // Run game-specific validation
    if (this.gameDefinition.validator) {
      const validationResult = this.gameDefinition.validator({
        state: this.currentState,
        action: validatedAction,
        playerId,
      });

      if (!validationResult.valid) {
        throw new Error(
          `Action validation failed: ${validationResult.reason || 'Unknown reason'}`,
        );
      }
    }

    // Run the pure reducer
    const oldState = this.currentState;
    const newState = this.runReducer(oldState, validatedAction);

    // Validate and save the new state (this can throw)
    this.updateState(oldState, newState, validatedAction);

    // Persist and broadcast
    await this.persistState();
    this.broadcastState();

    // Execute side effects and allow errors to propagate
    await this.executeEffects(validatedAction, depth);
  }

  /**
   * Validate an action against the game's action schema
   * @throws Error if action is invalid
   */
  private validateAction(action: any): any {
    try {
      return this.gameDefinition.actionSchema.parse(action);
    }
    catch (error) {
      if (error instanceof ZodError) {
        logger.error(
          error.issues,
          `[GameSessionManager] Zod validation failed for action ${action?.type || 'unknown'}:`,
        );
        throw new Error(
          `Action validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
        );
      }

      logger.error(
        error,
        `[GameSessionManager] Unexpected error during action validation ${action?.type || 'unknown'}`,
      );
      throw error;
    }
  }

  /**
   * Run the pure reducer to compute new state
   * @throws Error if reducer throws
   */
  private runReducer(state: BaseGameState, action: any): BaseGameState {
    try {
      return this.gameDefinition.reducer(state, action);
    }
    catch (reducerError) {
      logger.error(
        reducerError,
        `[GameSessionManager] Error in game reducer for action ${action.type}:`,
      );
      throw new Error(
        `Reducer error: ${reducerError instanceof Error ? reducerError.message : 'unknown'}`,
      );
    }
  }

  /**
   * Validate and update the current state
   * If new state is invalid, state is rolled back to oldState
   * @throws Error if state validation fails
   */
  private updateState(oldState: BaseGameState, newState: BaseGameState, action: any): void {
    try {
      // Validate the new state
      const validatedNewState = this.gameDefinition.stateSchema.parse(newState);

      // Only update if validation passed
      this.currentState = validatedNewState;

      logger.debug(oldState.players, '[GameSessionManager] State BEFORE action:');
      logger.debug(this.currentState.players, '[GameSessionManager] State AFTER action:');
    }
    catch (error) {
      // ROLLBACK: Keep old state
      this.currentState = oldState;

      if (error instanceof ZodError) {
        logger.error(
          error.issues,
          `[GameSessionManager] Zod validation failed for NEW state after action ${action.type}:`,
        );

        throw new Error(
          `New state validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
        );
      }

      logger.error(
        error,
        `[GameSessionManager] Unexpected error during new state validation ${action.type}:`,
      );
      throw error;
    }
  }

  /**
   * Persist state to durable storage
   */
  private async persistState(): Promise<void> {
    await this.ctx.blockConcurrencyWhile(async () => {
      await this.ctx.storage.put('state', this.currentState);
    });
  }

  /**
   * Broadcast current state to all connected WebSocket clients
   */
  private broadcastState(): void {
    const websockets = this.ctx.getWebSockets();
    logger.debug(
      `[GameSessionManager] Broadcasting state to ${websockets.length} clients. Current player count: ${Object.keys(this.currentState.players).length}`,
    );

    const message = JSON.stringify({
      type: 'onStateUpdate',
      payload: this.currentState,
    });

    for (const ws of websockets) {
      try {
        ws.send(message);
      }
      catch (error) {
        logger.error(error, '[GameSessionManager] Broadcast error:');
      }
    }
  }

  /**
   * Execute side effects via registered effect functions
   *
   * Effect functions can return a follow-up action to dispatch,
   * creating a cycle: Action → State Update → Effect → New Action → ...
   *
   * Example: NEXT_ROUND → (fetch questions) → LOAD_QUESTIONS
   *
   * Note: Effect errors are logged but do NOT throw
   */
  private async executeEffects(action: any, depth: number): Promise<void> {
    if (this.effectHandlers.length === 0) {
      return;
    }

    // Only log for timer-related actions
    const isTimerAction = ['START_TURN', 'START_ANSWERING', 'TIMES_UP', 'SUB_PHASE_TIMER_STARTED'].includes(action.type);

    if (isTimerAction) {
      logger.info(`[TimerDebug] ===== EFFECT EXECUTION for ${action.type} =====`);
    }

    const context = {
      state: this.currentState,
      action,
      apiUrl: this.apiUrl,
      ctx: this.ctx,
      dispatch: (followUpAction: any) =>
        this.dispatchAction(followUpAction, undefined, depth + 1),
    };

    // Run all effects in parallel
    const results = await Promise.allSettled(
      this.effectHandlers.map((effectHandler, index) => {
        return effectHandler(context).catch((err) => {
          if (isTimerAction) {
            logger.error(`[TimerDebug] Effect handler #${index} threw error:`, err);
          }
          throw err;
        });
      }),
    );

    const followUpActions: any[] = [];

    // Process any follow-up actions
    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (result.status === 'rejected') {
        if (isTimerAction) {
          logger.error(`[TimerDebug] ❌ Effect #${i} REJECTED for action ${action.type}:`, result.reason);
        }
        continue;
      }

      const followUpAction = result.value;

      if (followUpAction === null || followUpAction === undefined) {
        continue;
      }

      if (isTimerAction) {
        logger.info(`[TimerDebug] ✅ Effect #${i} returned follow-up action: ${followUpAction.type}`);
      }
      followUpActions.push(followUpAction);
    }

    if (isTimerAction) {
      logger.info(`[TimerDebug] ===== EFFECT EXECUTION COMPLETE for ${action.type} =====`);
    }

    // Dispatch all collected follow-up actions
    for (const followUpAction of followUpActions) {
      await this.dispatchAction(followUpAction, undefined, depth + 1);
    }
  }

  /**
   * Reset the game to its initial state
   */
  reset(): void {
    this.currentState = this.gameDefinition.stateSchema.parse(
      this.gameDefinition.initialState,
    );

    this.ctx.storage.put('state', this.currentState);

    this.broadcastState();
  }
}
