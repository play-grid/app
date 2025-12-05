import type { GameSessionManager } from './game-session.manager';

/**
 * A thin router that handles raw WebSocket messages and routes them
 * to the GameSessionManager.
 */
export class GameSessionRouter {
  constructor(
    private manager: GameSessionManager,
  ) {}

  async handleMessage(ws: WebSocket, rawMessage: string | ArrayBuffer) {
    try {
      const data = JSON.parse(typeof rawMessage === 'string' ? rawMessage : rawMessage.toString());

      if (!data.type) {
        console.warn('[GameSessionRouter] Message missing "type" field');
        return;
      }
      switch (data.type) {
        case 'dispatchAction':
          this.handleDispatchAction(ws, data.payload);
          break;

        case 'syncState':
          this.handleSyncState(ws);
          break;

        case 'ping':
          this.handlePing(ws, data.payload);
          break;

        default:
          console.warn(`[GameSessionRouter] Unknown message type: ${data.type}`);
      }
    }
    catch (error) {
      console.error('[GameSessionRouter] Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid message format or server error' },
      }));
    }
  }

  private handleDispatchAction(ws: WebSocket, payload: any) {
    try {
      // The manager validates the specific action schema
      this.manager.dispatchAction(payload.action);

      // Optional: Send acknowledgement
      ws.send(JSON.stringify({
        type: 'dispatchAction_result',
        payload: {
          success: true,
          requestId: payload.requestId,
        },
      }));
    }
    catch (error) {
      ws.send(JSON.stringify({
        type: 'dispatchAction_result',
        payload: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: payload.requestId,
        },
      }));
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
