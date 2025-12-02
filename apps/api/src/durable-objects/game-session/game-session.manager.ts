import type { BaseGameStateWire, GameDefinition } from '@guess-logo/game-core';
import { encodeHibernationRPCEvent } from '@orpc/server/hibernation';

export interface GameSessionManagerConfig {
  gameDefinition: GameDefinition<any, any>;
  initialState: Partial<BaseGameStateWire>;
  ctx: DurableObjectState;
}

export class GameSessionManager {
  private currentState: BaseGameStateWire;
  private gameDefinition: GameDefinition<any, any>;
  private ctx: DurableObjectState;

  constructor(config: GameSessionManagerConfig) {
    // Parse initialState to ensure proper defaults and validation
    this.currentState = config.gameDefinition.stateSchema.parse(
      config.initialState,
    );
    this.gameDefinition = config.gameDefinition;
    this.ctx = config.ctx;
  }

  getState(): BaseGameStateWire {
    return this.currentState;
  }

  /**
   * Dispatch an action - accepts any and validates internally
   */
  dispatchAction(action: any): void {
    try {
      const validatedAction = this.gameDefinition.actionSchema.parse(action);
      const newState = this.gameDefinition.reducer(
        this.currentState,
        validatedAction,
      );
      const validatedState = this.gameDefinition.stateSchema.parse(newState);

      this.currentState = validatedState;
      this.broadcastState();
    }
    catch (error) {
      console.error('[GameSessionManager] Action dispatch failed:', error);
      throw error;
    }
  }

  private broadcastState(): void {
    const websockets = this.ctx.getWebSockets();

    for (const ws of websockets) {
      try {
        const attachment = ws.deserializeAttachment();
        if (typeof attachment !== 'object' || attachment === null) {
          continue;
        }

        const { stateIteratorId } = attachment as { stateIteratorId?: string };
        if (!stateIteratorId) {
          continue;
        }

        ws.send(
          encodeHibernationRPCEvent(stateIteratorId, this.currentState),
        );
      }
      catch (error) {
        console.error('[GameSessionManager] Broadcast error:', error);
      }
    }
  }

  reset(): void {
    this.currentState = this.gameDefinition.stateSchema.parse(
      this.gameDefinition.initialState,
    );
    this.broadcastState();
  }
}
