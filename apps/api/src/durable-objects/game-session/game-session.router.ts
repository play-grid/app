import type { GameSessionManager } from './game-session.manager';
import { logger } from '@/utils/logger';

/**
 * A thin router that handles raw WebSocket messages and routes them
 * to the GameSessionManager.
 */
export class GameSessionRouter {
  private processingRequests = new Set<string>();
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds

  constructor(
    private manager: GameSessionManager,
  ) {}

  async handleMessage(ws: WebSocket, rawMessage: string | ArrayBuffer, _playerId?: string) {
    try {
      const data = JSON.parse(typeof rawMessage === 'string' ? rawMessage : rawMessage.toString());

      if (!data.type) {
        logger.warn('[GameSessionRouter] Message missing "type" field');
        return;
      }

      switch (data.type) {
        case 'dispatchAction':
          await this.handleDispatchAction(ws, data.payload, _playerId);
          break;

        case 'syncState':
          this.handleSyncState(ws);
          break;

        case 'ping':
          this.handlePing(ws, data.payload);
          break;

        default:
          logger.warn(`[GameSessionRouter] Unknown message type: ${data.type}`);
      }
    }
    catch (error) {
      logger.error(error, '[GameSessionRouter] Error handling message:');
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid message format or server error' },
      }));
    }
  }

  private async handleDispatchAction(ws: WebSocket, payload: any, playerId?: string) {
    const requestId = payload.requestId;

    // FIX: Prevent duplicate processing of the same request
    if (requestId && this.processingRequests.has(requestId)) {
      logger.warn(`[GameSessionRouter] Duplicate request ignored: ${requestId}`);
      // Still send acknowledgement for the duplicate
      ws.send(JSON.stringify({
        type: 'dispatchAction_result',
        payload: {
          success: true,
          requestId,
          note: 'Duplicate request, already processing',
        },
      }));
      return;
    }

    // Mark request as processing
    if (requestId) {
      this.processingRequests.add(requestId);
    }

    try {
      // The manager validates the specific action schema
      await this.manager.dispatchAction(payload.action, playerId);

      // Send success acknowledgement
      ws.send(JSON.stringify({
        type: 'dispatchAction_result',
        payload: {
          success: true,
          requestId,
        },
      }));
    }
    catch (error) {
      logger.error(error, '[GameSessionRouter] Action dispatch error:');

      // Send error acknowledgement
      ws.send(JSON.stringify({
        type: 'dispatchAction_result',
        payload: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId,
        },
      }));
    }
    finally {
      // FIX: Clean up request tracking after timeout
      if (requestId) {
        setTimeout(() => {
          this.processingRequests.delete(requestId);
          // logger.debug(`[GameSessionRouter] Cleaned up request: ${requestId}`);
        }, this.REQUEST_TIMEOUT);
      }
    }
  }

  private handleSyncState(ws: WebSocket) {
    const state = this.manager.getState();
    ws.send(JSON.stringify({
      type: 'onStateUpdate',
      payload: state,
    }));
  }

  private handlePing(ws: WebSocket, payload: any) {
    ws.send(JSON.stringify({
      type: 'pong',
      payload: {
        clientTimestamp: payload?.timestamp,
        serverTimestamp: Date.now(),
      },
    }));
  }
}

// Factory function to keep the API similar
export function createGameSessionRouter(
  manager: GameSessionManager,
) {
  return new GameSessionRouter(manager);
}
