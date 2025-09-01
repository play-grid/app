import type { Env } from 'hono';
import { DurableObject } from 'cloudflare:workers';

interface SessionData {
  roomId: string;
  playerId?: string;
  joinedAt: number;
}

export class GameRoom extends DurableObject {
  // Track all WebSocket sessions
  sessions: Map<WebSocket, SessionData>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();

    // Restore hibernated WebSocket connections
    this.ctx.getWebSockets().forEach((ws) => {
      const attachment = ws.deserializeAttachment() as SessionData | null;
      if (attachment) {
        // Restore the session state from the attachment
        this.sessions.set(ws, attachment);
      }
    });

    // Set auto-response for ping-pong without waking the DO
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('ping', 'pong'),
    );
  }

  async fetch(request: Request): Promise<Response> {
    // Validate WebSocket upgrade request
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // Create WebSocket pair
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Accept the server-side connection for hibernation
    this.ctx.acceptWebSocket(server);

    // Generate session data
    const roomId = crypto.randomUUID();
    const sessionData: SessionData = {
      roomId,
      joinedAt: Date.now(),
    };

    // Serialize attachment for hibernation persistence
    server.serializeAttachment(sessionData);

    // Add to active sessions
    this.sessions.set(server, sessionData);

    // Notify other clients about new connection
    this.broadcastToOthers(server, {
      type: 'user_joined',
      roomId,
      totalConnections: this.sessions.size,
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    const session = this.sessions.get(ws);
    if (!session) {
      // This shouldn't happen, but handle gracefully
      ws.send(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    let messageData;
    try {
      // Parse message as JSON if it's a string
      messageData = typeof message === 'string' ? JSON.parse(message) : message;
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      // If not JSON, treat as plain message
      messageData = { type: 'message', content: message };
    }

    // Echo message back to sender
    ws.send(JSON.stringify({
      type: 'echo',
      originalMessage: messageData,
      from: session.roomId,
      totalConnections: this.sessions.size,
    }));

    // Broadcast to all other clients
    this.broadcastToOthers(ws, {
      type: 'broadcast',
      message: messageData,
      from: session.roomId,
      totalConnections: this.sessions.size,
    });
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    const session = this.sessions.get(ws);

    // Remove from sessions
    this.sessions.delete(ws);

    // Notify remaining clients about disconnection
    if (session) {
      this.broadcastToAll({
        type: 'user_left',
        roomId: session.roomId,
        totalConnections: this.sessions.size,
        reason: wasClean ? 'normal' : 'abnormal',
      });
    }

    // Don't call ws.close() here - the connection is already closing
    // eslint-disable-next-line no-console
    console.log(`WebSocket closed: code=${code}, reason=${reason}, wasClean=${wasClean}`);
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error('WebSocket error:', error);

    // Clean up the session
    const session = this.sessions.get(ws);
    this.sessions.delete(ws);

    // Notify about error disconnection
    if (session) {
      this.broadcastToAll({
        type: 'user_error',
        roomId: session.roomId,
        totalConnections: this.sessions.size,
      });
    }
  }

  // Helper method to broadcast to all clients except the sender
  private broadcastToOthers(sender: WebSocket, data: any) {
    const message = JSON.stringify(data);
    this.sessions.forEach((sessionData, ws) => {
      if (ws !== sender && ws.readyState === WebSocket.READY_STATE_OPEN) {
        try {
          ws.send(message);
        }
        catch (error) {
          console.error('Failed to send to client:', error);
          // Clean up failed connection
          this.sessions.delete(ws);
        }
      }
    });
  }

  // Helper method to broadcast to all clients
  private broadcastToAll(data: any) {
    const message = JSON.stringify(data);
    this.sessions.forEach((sessionData, ws) => {
      if (ws.readyState === WebSocket.READY_STATE_OPEN) {
        try {
          ws.send(message);
        }
        catch (error) {
          console.error('Failed to send to client:', error);
          // Clean up failed connection
          this.sessions.delete(ws);
        }
      }
    });
  }

  // Optional: Method to get room statistics
  getRoomStats() {
    return {
      totalConnections: this.sessions.size,
      sessions: Array.from(this.sessions.values()).map(session => ({
        roomId: session.roomId,
        joinedAt: session.joinedAt,
        duration: Date.now() - session.joinedAt,
      })),
    };
  }
}
