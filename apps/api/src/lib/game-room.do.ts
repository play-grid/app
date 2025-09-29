import type { Env } from 'hono';
import type { GameState, IGameLogic } from '../game-engine/game-logic';
import { DurableObject } from 'cloudflare:workers';
import { gameLogicFactory } from '../game-engine/game-logic.factory';

// --- Generic Types --- //
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
  selectedSet?: string;
  selectedGrid?: string;
}

export interface GameRoomStats {
  totalConnections: number;
  maxPlayers: number;
  roomConfig: GameRoomConfig | null;
  sessions: {
    roomId: string;
    playerId?: string;
    joinedAt: number;
    duration: number;
  }[];
}
// --- End of Generic Types --- //

export class GameRoomDurableObject extends DurableObject {
  sessions: Map<WebSocket, SessionData>;
  config: GameRoomConfig | null;
  state: GameState;
  gameLogic: IGameLogic | null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();
    this.config = null;
    this.state = {};
    this.gameLogic = null;

    // Load persisted state and initialize game logic
    this.ctx.storage.get(['config', 'state']).then((persisted) => {
      if (persisted.has('config')) {
        this.config = persisted.get('config') as GameRoomConfig;
        if (this.config) {
          this.gameLogic = gameLogicFactory(this.config.gameType);
        }
      }
      if (persisted.has('state')) {
        this.state = persisted.get('state') as GameState;
      }
    });

    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('ping', 'pong'),
    );
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === '/init' && request.method === 'POST') {
      return this.handleInit(request);
    }
    if (pathname === '/join' && request.method === 'POST') {
      return this.handleJoin(request);
    }
    if (pathname === '/stats' && request.method === 'GET') {
      return this.handleStats();
    }

    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleInit(request: Request): Promise<Response> {
    const body = await request.json() as GameRoomConfig;
    this.config = {
      ...body,
      createdAt: new Date().toISOString(),
    };

    // Get the game logic module for the specified game type
    this.gameLogic = gameLogicFactory(this.config.gameType);
    if (!this.gameLogic) {
      return new Response(`Invalid game type: ${this.config.gameType}`, { status: 400 });
    }

    // Initialize the game state using the game logic module
    this.state = this.gameLogic.getInitialState(this.config);

    await this.ctx.storage.put('config', this.config);
    await this.ctx.storage.put('state', this.state);

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  private async handleJoin(request: Request): Promise<Response> {
    if (!this.config || !this.gameLogic) {
      return new Response('Room not initialized', { status: 400 });
    }

    const { playerName } = await request.json<{ playerName: string }>();

    // Delegate join logic and player limit checks to the game module
    const joinResult = this.gameLogic.onPlayerJoin(this.state, playerName);

    if (!joinResult.success) {
      return new Response(JSON.stringify({ error: joinResult.error || 'Failed to join room' }), {
        status: 403, // Forbidden
        headers: { 'Content-Type': 'application/json' },
      });
    }

    this.state = joinResult.newState;

    await this.ctx.storage.put('state', this.state);
    this.broadcastGameState();

    // Return a success response including the player info
    return new Response(JSON.stringify({ ...this.state, player: joinResult.player }), { headers: { 'Content-Type': 'application/json' } });
  }

  private async handleWebSocketUpgrade(_request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketOpen(ws: WebSocket) {
    const sessionData: SessionData = {
      roomId: this.config?.roomId ?? '',
      joinedAt: Date.now(),
    };
    this.sessions.set(ws, sessionData);

    // Send the current game state to the newly connected client
    ws.send(JSON.stringify({
      type: 'GAME_STATE_UPDATE',
      payload: this.state,
    }));
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    if (!this.gameLogic)
      return;

    const session = this.sessions.get(ws);
    if (!session)
      return;

    try {
      const messageData = JSON.parse(message as string);
      const { type, payload } = messageData;

      // Delegate action handling to the game logic module
      const newState = this.gameLogic.handleAction(this.state, type, payload, session.playerId ?? '');
      this.state = newState;

      // Persist and broadcast the updated state
      await this.ctx.storage.put('state', this.state);
      this.broadcastGameState();
    }
    catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.sessions.delete(ws);
    // Here you could delegate to gameLogic.onPlayerLeave if needed
  }

  async webSocketError(ws: WebSocket) {
    this.sessions.delete(ws);
  }

  private async handleStats(): Promise<Response> {
    const now = Date.now();
    const sessionDetails = Array.from(this.sessions.values()).map(s => ({
      ...s,
      duration: now - s.joinedAt,
    }));

    const stats: GameRoomStats = {
      totalConnections: this.sessions.size,
      maxPlayers: this.config?.maxPlayers ?? 0,
      roomConfig: this.config,
      sessions: sessionDetails,
    };
    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private broadcastGameState() {
    const message = JSON.stringify({
      type: 'GAME_STATE_UPDATE',
      payload: this.state,
    });
    this.sessions.forEach((_session, ws) => {
      if (ws.readyState === WebSocket.READY_STATE_OPEN) {
        ws.send(message);
      }
    });
  }
}
