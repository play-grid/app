import type { Env } from 'hono';
import { DurableObject } from 'cloudflare:workers';

interface SessionData {
  roomId: string;
  playerId?: string;
  joinedAt: number;
}

interface GameRoomConfig {
  roomId: string;
  name: string;
  maxPlayers: number;
  gameType: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface GameRoomStats {
  totalConnections: number;
  maxPlayers: number;
  roomConfig: GameRoomConfig | null;
  sessions: Array<{
    roomId: string;
    playerId?: string;
    joinedAt: number;
    duration: number;
  }>;
}

export class GameRoomDurableObject extends DurableObject {
  // Track all WebSocket sessions
  sessions: Map<WebSocket, SessionData>;
  // Room configuration
  config: GameRoomConfig | null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();
    this.config = null;

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
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle internal initialization
    if (pathname === '/init' && request.method === 'POST') {
      return this.handleInit(request);
    }

    // Handle internal stats request
    if (pathname === '/stats' && request.method === 'GET') {
      return this.handleStats();
    }

    // Handle WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleInit(request: Request): Promise<Response> {
    try {
      const body = await request.json() as GameRoomConfig;
      this.config = {
        ...body,
        createdAt: new Date().toISOString(),
      };

      // Persist the configuration
      await this.ctx.storage.put('config', this.config);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    catch (error) {
      console.error('Error initializing room:', error);
      return new Response(JSON.stringify({ error: 'Failed to initialize room' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  private async handleStats(): Promise<Response> {
    if (!this.config) {
      // Try to load config from storage
      this.config = await this.ctx.storage.get('config') as GameRoomConfig | null;
      if (!this.config) {
        return new Response(JSON.stringify({ error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const stats = this.getRoomStats();
    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    // Validate WebSocket upgrade request
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // Load config if not already loaded
    if (!this.config) {
      this.config = await this.ctx.storage.get('config') as GameRoomConfig | null;
      if (!this.config) {
        return new Response('Game room not initialized', { status: 400 });
      }
    }

    // Check if room is full
    if (this.sessions.size >= this.config.maxPlayers) {
      return new Response('Game room is full', { status: 403 });
    }

    // Create WebSocket pair
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Accept the server-side connection for hibernation
    this.ctx.acceptWebSocket(server);

    // Generate session data
    const sessionData: SessionData = {
      roomId: this.config.roomId,
      playerId: crypto.randomUUID(), // Generate unique player ID
      joinedAt: Date.now(),
    };

    // Serialize attachment for hibernation persistence
    server.serializeAttachment(sessionData);

    // Add to active sessions
    this.sessions.set(server, sessionData);

    // Notify other clients about new connection
    this.broadcastToOthers(server, {
      type: 'user_joined',
      roomId: this.config.roomId,
      playerId: sessionData.playerId,
      totalConnections: this.sessions.size,
      maxPlayers: this.config.maxPlayers,
    });

    // Send welcome message to the new client
    server.send(JSON.stringify({
      type: 'welcome',
      roomId: this.config.roomId,
      playerId: sessionData.playerId,
      roomConfig: this.config,
      totalConnections: this.sessions.size,
    }));

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

    // Handle different message types
    switch (messageData.type) {
      case 'chat':
        this.handleChatMessage(session, messageData);
        break;
      case 'game_action':
        this.handleGameAction(ws, session, messageData);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
      default:
        // Echo unknown messages back to sender
        ws.send(JSON.stringify({
          type: 'echo',
          originalMessage: messageData,
          from: session.playerId,
          totalConnections: this.sessions.size,
        }));
    }
  }

  private handleChatMessage(session: SessionData, messageData: any) {
    // Broadcast chat message to all clients
    this.broadcastToAll({
      type: 'chat',
      message: messageData.message,
      from: session.playerId,
      timestamp: Date.now(),
    });
  }

  private handleGameAction(ws: WebSocket, session: SessionData, messageData: any) {
    // Handle game-specific actions
    this.broadcastToOthers(ws, {
      type: 'game_action',
      action: messageData.action,
      data: messageData.data,
      from: session.playerId,
      timestamp: Date.now(),
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
        playerId: session.playerId,
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
        playerId: session.playerId,
        roomId: session.roomId,
        totalConnections: this.sessions.size,
      });
    }
  }

  // Helper method to broadcast to all clients except the sender
  private broadcastToOthers(sender: WebSocket, data: any) {
    const message = JSON.stringify(data);
    this.sessions.forEach((_sessionData, ws) => {
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
    this.sessions.forEach((_sessionData, ws) => {
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

  // Method to get room statistics
  getRoomStats(): GameRoomStats {
    return {
      totalConnections: this.sessions.size,
      maxPlayers: this.config?.maxPlayers || 4,
      roomConfig: this.config,
      sessions: Array.from(this.sessions.values()).map(session => ({
        roomId: session.roomId,
        playerId: session.playerId,
        joinedAt: session.joinedAt,
        duration: Date.now() - session.joinedAt,
      })),
    };
  }
}
