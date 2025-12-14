import type { BaseGameState, GameDefinition, GameEffect } from '@guess-logo/game-core';
import { GameActionSchema } from '@guess-logo/game-core';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

export interface GameSessionManagerConfig {
  gameDefinition: GameDefinition<any, any>;
  initialState: BaseGameState;
  ctx: DurableObjectState;
  effectHandlers?: GameEffect[];
  apiUrl?: string;
}

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
  private isProcessingEffects: boolean = false;

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
   */
  async dispatchAction(action: any): Promise<void> {
    logger.debug(`[GameSessionManager] Dispatching action: ${action?.type}`);
    logger.debug({ action }, '[GameSessionManager] Action payload (raw):');

    // Validate the action
    const validatedAction = this.validateAction(action);
    logger.debug(validatedAction, '[GameSessionManager] Action payload (validated and parsed):');

    // Run the pure reducer
    const oldState = this.currentState;
    const newState = this.runReducer(oldState, validatedAction);

    // Validate and save the new state
    this.updateState(oldState, newState, validatedAction);

    // Persist and broadcast
    await this.persistState();
    this.broadcastState();

    // Execute side effects (non-blocking)
    this.executeEffects(validatedAction).catch((error) => {
      logger.error(error, '[GameSessionManager] Effect execution failed:');
    });
  }

  /**
   * Validate an action against the game's action schema
   */
  private validateAction(action: any): any {
    const coreActionTypes = GameActionSchema.options.map(
      schema => schema.shape.type.def.values,
    );
    const coreActions = new Set(coreActionTypes);

    try {
      return this.gameDefinition.actionSchema.parse(action);
    }
    catch (error) {
      // Allow core actions to pass through even if not in game schema
      if (coreActions.has(action?.type)) {
        return action;
      }

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
   */
  private updateState(oldState: BaseGameState, newState: BaseGameState, action: any): void {
    try {
      this.currentState = this.gameDefinition.stateSchema.parse(newState);

      logger.debug(oldState.players, '[GameSessionManager] State BEFORE action:');
      logger.debug(this.currentState.players, '[GameSessionManager] State AFTER action:');
    }
    catch (error) {
      if (error instanceof ZodError) {
        logger.error(
          error.issues,
          `[GameSessionManager] Zod validation failed for NEW state after action ${action.type}:`,
        );

        // Rollback to old state
        this.currentState = oldState;
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
   */
  private async executeEffects(action: any): Promise<void> {
    if (this.isProcessingEffects) {
      logger.warn('[GameSessionManager] Already processing effects, skipping to prevent loops');
      return;
    }

    if (this.effectHandlers.length === 0) {
      logger.debug('[GameSessionManager] No effects registered');
      return;
    }

    this.isProcessingEffects = true;

    try {
      logger.debug(`[GameSessionManager] Running ${this.effectHandlers.length} effect(s) for action: ${action.type}`);

      const context = {
        state: this.currentState,
        action,
        apiUrl: this.apiUrl,
        ctx: this.ctx,
      };

      // Run all effects in parallel
      const results = await Promise.allSettled(
        this.effectHandlers.map(effectHandlers => effectHandlers(context)),
      );

      // Process any follow-up actions
      for (const result of results) {
        if (result.status === 'rejected') {
          logger.error(
            result.reason,
            `[GameSessionManager] Effect failed for action ${action.type}:`,
          );
          continue;
        }

        const followUpAction = result.value;
        if (followUpAction) {
          logger.info(
            `[GameSessionManager] Effect returned follow-up action: ${followUpAction.type}`,
          );
          // Dispatch the follow-up action (recursive call)
          await this.dispatchAction(followUpAction);
        }
      }
    }
    finally {
      this.isProcessingEffects = false;
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
