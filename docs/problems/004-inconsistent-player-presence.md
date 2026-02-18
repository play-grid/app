# Problem: Inconsistent Player Presence and Room Membership Behavior During Connection Interruptions

**Status:** Identified
**Date:** Feb 18, 2026
**Related Issues:**
- [System Context](./SYSTEM_CONTEXT.md) - Durable Objects as authoritative session manager
- [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md) - Platform vs game logic separation

---

## Problem Description

The multiplayer session system exhibits inconsistent player presence and room membership behavior during connection interruptions, particularly when clients refresh or reconnect while a game is in progress.

Players who refresh their browser are frequently removed from the active session from the transport layer perspective while remaining in the authoritative state, or conversely are rejected from reconnecting despite being valid participants. This results in scenarios including players being unintentionally "kicked," ghost players occupying room capacity, and additional clients connecting without being properly registered in the player list (spectator-like state).

The issue indicates a mismatch between player identity, WebSocket connection lifecycle, and Durable Object session state. The system currently lacks a unified source of truth for player presence and does not consistently reconcile ephemeral connection state with persisted game state.

---

## Current Implementation

### Three Separate Layers of Player Tracking

The system maintains player information in three separate layers that are not automatically synchronized:

#### Layer 1: WebSocket Connection Layer (Transport)

```typescript
// apps/api/src/durable-objects/game-session/game-session.object.ts
// Lines 46-49

export class GameSessionObject extends DurableObject<AppEnv['Bindings']> {
  // Connection tracking maps (in-memory only, not persisted)
  private playerIds = new Map<WebSocket, string>();        // WS → playerId
  private playerConnections = new Map<string, WebSocket>(); // playerId → WS (ONE per player)
```

**Behavior:**
- Maps are maintained in instance memory (reset on DO eviction/restart)
- Each player can have only ONE active WebSocket connection
- When a WebSocket closes, entries are removed from both maps
- NO game state changes occur on WebSocket disconnect
- Player remains in the game state even after WebSocket closes

**WebSocket Close Handler (lines 273-292):**
```typescript
async webSocketClose(ws: WebSocket): Promise<void> {
  const playerId = this.playerIds.get(ws);
  this.playerIds.delete(ws);

  // Only remove from playerConnections if this is the current connection
  if (playerId && this.playerConnections.get(playerId) === ws) {
    this.playerConnections.delete(playerId);
    logger.info(`❌ WebSocket disconnected for player: ${playerId}`);
    logger.info(`📊 Remaining connections: ${this.playerConnections.size}`);
  }
}
```

**Key Observation:** When `webSocketClose()` runs, only the connection maps are cleaned up. The player is NOT removed from the game state.

---

#### Layer 2: Game State Layer (Authoritative)

```typescript
// apps/api/src/durable-objects/game-session/game-session.manager.ts
// Lines 30-325

export class GameSessionManager {
  private currentState: BaseGameState;
  private gameDefinition: GameDefinition<any, any>;

  // State includes players object
  // state.players = { [playerId]: { id, name, isHost, isReady, score } }
```

**Behavior:**
- Players stored in `state.players` object
- Persisted to Durable Object storage (`ctx.storage.put('state', state)`)
- Survives WebSocket disconnection, DO hibernation, and DO restart
- Players are only removed via `REMOVE_PLAYER` action dispatched through the manager

**No Automatic Removal Logic:**
- There is NO mechanism to automatically dispatch `REMOVE_PLAYER` when a WebSocket disconnects
- There is NO idle timeout or inactivity detection
- There is NO last activity tracking for players
- Players remain in state indefinitely until explicitly removed

---

#### Layer 3: Credentials Layer (Authentication)

```typescript
// apps/api/src/durable-objects/game-session/game-session.object.ts
// Lines 364-369, 436-442

credentials = crypto.randomUUID();
const credentialsData = {
  playerId,
  expiresAt: Date.now() + 5 * 60 * 1000,  // 5 minutes
};
await this.ctx.storage.put(`credentials:${credentials}`, credentialsData);
```

**Behavior:**
- Credentials generated when player creates or joins a room
- Stored in Durable Object storage with 5-minute expiration
- Used to validate WebSocket upgrade requests

**Credential Validation (lines 519-577):**
```typescript
private async handleValidateCredentials(request: Request): Promise<Response> {
  // ...
  const storedData = await this.ctx.storage.get<{ playerId: string; expiresAt: number }>(`credentials:${credentials}`);

  if (!storedData) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  if (storedData.playerId !== playerId || storedData.expiresAt < Date.now()) {
    return new Response(JSON.stringify({ error: 'Invalid or expired credentials' }), { status: 401 });
  }
  // ...
}
```

**Key Issues:**
- Credentials expire after exactly 5 minutes
- NO credential refresh mechanism exists
- NO cleanup of expired credentials from storage
- Expired credentials remain in DO storage indefinitely

---

### WebSocket Upgrade Flow

#### 1. API Route Handler Validates Credentials

```typescript
// apps/api/src/routes/game-room/game-room.handlers.ts
// Lines 283-334

async function websocketUpgrade(c: Context<AppEnv>): Promise<Response> {
  const url = new URL(c.req.url);
  const playerId = url.searchParams.get('playerId');
  const credentials = url.searchParams.get('credentials');

  // Validate credentials with Durable Object
  const validationResponse = await stub.fetch(
    `http://internal/validate-credentials?playerId=${playerId}&credentials=${credentials}`
  );

  if (!validationResponse.ok) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Upgrade to WebSocket
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  await stub.acceptWebSocket(server);

  return new Response(null, { status: 101, webSocket: client });
}
```

**Behavior:** Credentials are validated at the API route level before WebSocket upgrade.

---

#### 2. Durable Object WebSocket Handler

```typescript
// apps/api/src/durable-objects/game-session/game-session.object.ts
// Lines 182-243

private async handleWebSocketUpgrade(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const playerId = url.searchParams.get('playerId');

  // ❌ CRITICAL: Credentials NOT validated again here
  // Assumes API route already validated them

  // PREVENT GHOST PLAYERS: Verify player exists in current state
  const state = this.manager!.getState();
  if (!state.players[playerId]) {
    logger.warn(`Rejected ghost player connection: ${playerId} (not in game state)`);
    return new Response('Player not in game session', { status: 403 });
  }

  // Close old connection if player reconnects
  const existingWs = this.playerConnections.get(playerId);
  if (existingWs) {
    logger.info(`Player ${playerId} reconnecting - closing old connection`);
    existingWs.close(1000, 'New connection established');
    this.playerIds.delete(existingWs);
  }

  const { 0: client, 1: server } = new WebSocketPair();
  this.ctx.acceptWebSocket(server);

  // Track connection
  this.playerIds.set(server, playerId);
  this.playerConnections.set(playerId, server);

  return new Response(null, { status: 101, webSocket: client });
}
```

**Behavior:**
- Only validates that playerId exists in current game state
- Rejects connections from players not in the game state (ghost player prevention)
- Replaces old WebSocket if player is already connected
- Does NOT re-validate credentials (trusts API route)

---

### Frontend Reconnection Behavior

#### Credentials Storage

```typescript
// apps/frontend/src/features/room/room-store.tsx
// Lines 22-58

const useRoomSessionStore = create<RoomSessionState>()(
  persist(
    (set, get) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'room-session-storage', // localStorage
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// Stored data includes:
// {
//   roomId: string;
//   playerId: string;
//   playerName: string;
//   credentials: string;
//   initialGameState?: any;
// }
```

**Behavior:** Session stored in localStorage via Zustand persist middleware.

---

#### Multiplayer Adapter Reconnection

```typescript
// packages/game-core/src/adapters/multiplayer/client/multiplayer.adapter.ts
// Lines 35-48

this.websocket = new WebSocket(
  async () => {
    const roomId = config.room;
    const token = config.token ? `?token=${config.token}` : '';
    return `ws://${config.wsUrl}/api/game-room/${roomId}/ws${token}`;
  },
  [],
  {
    debug: true,
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
  },
);
```

**Behavior:**
- Uses PartySocket for automatic reconnection with exponential backoff
- WebSocket URL is constructed once at adapter creation time
- Credentials are baked into the URL (via token parameter) and never refreshed
- Reconnection attempts use the SAME credentials indefinitely

---

#### Fallback to Local Mode

```typescript
// apps/frontend/src/games/five-seconds/five-seconds-layout.tsx
// Lines 70-77

const hasValidSession = session?.roomId === roomId && session?.credentials;
const isMultiplayer = mode === 'multiplayer' && roomId && hasValidSession;

if (isMultiplayer) {
  // Create multiplayer adapter
  adapter = createMultiplayerAdapter({ ... });
} else {
  // ❌ SILENT FALLBACK: Creates local adapter without notifying user
  adapter = createLocalAdapter({ ... });
}
```

**Behavior:** If credentials are missing or invalid, the app silently falls back to local mode without showing any error message to the user.

---

### REMOVE_PLAYER Action (Manual Removal Only)

```typescript
// packages/game-core/src/game-logic/reducer.ts
// Lines 40-46

case 'REMOVE_PLAYER': {
  const { playerId } = action.payload;
  return {
    ...state,
    players: removePlayer(state, playerId),
  };
}

// packages/game-core/src/game-logic/actions.ts
// Lines 326-360

function removePlayer(state: BaseGameState, playerId: string): Record<string, Player> {
  const newPlayers = { ...state.players };
  delete newPlayers[playerId];

  // Host migration logic
  if (state.players[playerId]?.isHost) {
    const remainingPlayers = Object.values(newPlayers);
    if (remainingPlayers.length > 0) {
      newPlayers[remainingPlayers[0].id].isHost = true;
    }
  }

  return newPlayers;
}
```

**Behavior:**
- `REMOVE_PLAYER` action exists and is fully functional
- Removes player from game state, handles host migration
- Can be called via React hook: `useGameActions().removePlayer(playerId)`
- NOT called automatically when WebSocket disconnects

---

## Problem Scenarios

### Scenario 1: Browser Refresh Within 5 Minutes

**Flow:**
1. Player is in game, has active WebSocket connection
2. Player refreshes browser
3. WebSocket closes, connection maps cleaned up
4. Frontend retrieves session from localStorage (credentials still valid)
5. Frontend creates multiplayer adapter with existing credentials
6. PartySocket reconnects automatically
7. WebSocket upgrade succeeds (credentials still valid, player in state)

**Result:** ✅ Successful reconnection, player resumes game

---

### Scenario 2: Browser Refresh After 5 Minutes

**Flow:**
1. Player is in game, has active WebSocket connection
2. Player refreshes browser after 5+ minutes
3. WebSocket closes, connection maps cleaned up
4. Frontend retrieves session from localStorage
5. Credentials expired, but frontend doesn't know this
6. PartySocket attempts reconnection with expired credentials
7. WebSocket upgrade fails (401 Invalid credentials)
8. Frontend receives error, logs it
9. App detects multiplayer session invalid
10. **Silently falls back to local mode**

**Result:** ❌ Player unexpectedly in local mode, no notification, ghost player remains in room state

---

### Scenario 3: Network Disconnection (Brief)

**Flow:**
1. Player experiences network blip (WiFi dropout)
2. WebSocket closes, connection maps cleaned up
3. PartySocket detects disconnect, waits 1s, attempts reconnect
4. Network restored, reconnection succeeds
5. Player resumes game seamlessly

**Result:** ✅ Successful reconnection (if <5 min) or failure (if >5 min)

---

### Scenario 4: Network Disconnection (Extended)

**Flow:**
1. Player experiences extended network outage (10 minutes)
2. WebSocket closes, connection maps cleaned up
3. Player remains in game state (no automatic removal)
4. Other players see player as still in room (in state but no connection)
5. PartySocket repeatedly attempts reconnection
6. Eventually gives up (credentials expire)
7. Player returns to app, sees ghost player in room
8. Cannot reconnect (credentials expired, no refresh mechanism)
9. Must manually re-join room (if room not full)

**Result:** ❌ Ghost player occupies room, player must re-join manually

---

### Scenario 5: Player Leaves Without Explicit Removal

**Flow:**
1. Player closes browser tab without leaving room explicitly
2. WebSocket closes, connection maps cleaned up
3. Player remains in game state indefinitely
4. Host or other players must manually remove player via UI
5. Room capacity still counts the disconnected player

**Result:** ❌ Player occupies room capacity until manually removed

---

## Problems

### 1. **Three Independent Layers with No Synchronization**

Player presence is tracked in three separate layers that evolve independently:

| Layer | What It Tracks | Persistence | When Updated |
|-------|----------------|-------------|--------------|
| **Connection Maps** | Active WebSocket connections | In-memory only | On WebSocket connect/close |
| **Game State** | Players in the room | Persisted to DO storage | On `ADD_PLAYER` / `REMOVE_PLAYER` actions |
| **Credentials** | Authentication tokens | Persisted to DO storage | On room create/join |

**Problem:** These layers are never automatically synchronized. When one layer changes (e.g., WebSocket disconnect), the others remain unchanged.

---

### 2. **No Automatic Player Removal on Disconnect**

When `webSocketClose()` is called, the system:

1. ✅ Removes WebSocket from connection maps
2. ❌ Does NOT dispatch `REMOVE_PLAYER` action
3. ❌ Does NOT update game state
4. ❌ Does NOT notify other players

**Result:** Players remain in game state indefinitely after disconnection.

---

### 3. **No Idle Timeout or Inactivity Detection**

The system lacks:

- ❌ `lastConnectedAt` timestamp for each player
- ❌ `lastActivityAt` timestamp for player actions
- ❌ Idle player detection mechanism
- ❌ Automatic removal of inactive players

**Result:** Players can stay disconnected indefinitely while occupying room capacity.

---

### 4. **Credential System Issues**

#### a. No Credential Refresh Mechanism

- Credentials expire after exactly 5 minutes
- No endpoint to refresh or renew credentials
- Players cannot reconnect after expiration

#### b. No Credential Cleanup

- Expired credentials remain in DO storage indefinitely
- No scheduled cleanup task
- Potential memory leak for long-running rooms

#### c. Baked-In Credentials

- PartySocket constructs WebSocket URL once at creation
- Credentials are never refreshed during reconnection attempts
- Reconnection continues to fail with expired credentials

---

### 5. **Silent Fallback to Local Mode**

When credentials are invalid or multiplayer session fails:

```typescript
// apps/frontend/src/games/five-seconds/five-seconds-layout.tsx

if (isMultiplayer) {
  adapter = createMultiplayerAdapter({ ... });
} else {
  // ❌ Silent fallback - no user notification
  adapter = createLocalAdapter({ ... });
}
```

**Result:** Players may not realize they're playing locally instead of multiplayer.

---

### 6. **Validation Gap in WebSocket Handler**

Credentials are validated in the API route handler:

```typescript
// apps/api/src/routes/game-room/game-room.handlers.ts

const validationResponse = await stub.fetch(
  `http://internal/validate-credentials?playerId=${playerId}&credentials=${credentials}`
);

if (!validationResponse.ok) {
  return c.json({ error: 'Invalid credentials' }, 401);
}
```

But NOT validated in the Durable Object's WebSocket handler:

```typescript
// apps/api/src/durable-objects/game-session/game-session.object.ts

private async handleWebSocketUpgrade(request: Request): Promise<Response> {
  // ❌ No credential validation here
  // Assumes API route already validated

  const state = this.manager!.getState();
  if (!state.players[playerId]) {
    return new Response('Player not in game session', { status: 403 });
  }
  // ...
}
```

**Result:** Security trust boundary depends on API route validation only.

---

### 7. **Room Capacity Inconsistency**

Room max players is enforced during join:

```typescript
// apps/api/src/durable-objects/game-session/game-session.object.ts
// Lines 427-432

const currentPlayerCount = Object.keys(currentState.players).length;

if (currentPlayerCount >= this.metadata.maxPlayers) {
  return new Response(JSON.stringify({ error: 'Room is full' }), { status: 400 });
}
```

But this only counts players in state, not connected players:

- Disconnected players (still in state but no WebSocket) count toward capacity
- Ghost players prevent new players from joining

**Result:** Rooms can appear full even when few players are actively connected.

---

### 8. **No Room Lifecycle Management**

The system lacks:

- ❌ Automatic room cleanup when all players disconnect
- ❌ Room deletion for inactive sessions
- ❌ Room expiration mechanism
- ❌ Cleanup of empty rooms

**Result:** Empty rooms persist indefinitely in Durable Objects.

---

### 9. **No Heartbeat or Keep-Alive**

Basic ping/pong exists but is not used for presence:

```typescript
// apps/api/src/durable-objects/game-session/game-session.router.ts
// Lines 119-127

private handlePing(ws: WebSocket, payload: any) {
  ws.send(JSON.stringify({
    type: 'pong',
    payload: {
      clientTimestamp: payload?.timestamp,
      serverTimestamp: Date.now(),
    },
  }));
}
```

**Result:** No automatic detection of stale or inactive connections.

---

## Impact

### User Experience

- ❌ Players can become ghost players without knowing
- ❌ Cannot reconnect after 5 minutes of disconnection
- ❌ Unexpected fallback to local mode without notification
- ❌ Room capacity blocked by disconnected players
- ❌ Host must manually remove inactive players

### System Reliability

- ❌ Connection state and game state can diverge
- ❌ No unified source of truth for player presence
- ❌ Inconsistent behavior between short and long disconnects
- ❌ Expired credentials accumulate in storage

### Developer Experience

- ❌ Complex three-layer architecture to understand
- ❌ No clear lifecycle for player presence
- ❌ Manual player removal required
- ❌ Hard to debug presence issues

---

## Related Documentation

- [System Context](./SYSTEM_CONTEXT.md) - Durable Objects as authoritative session manager
- [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md) - Platform vs game logic separation
- [ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md) - Dependency constraints

---

**Last Updated:** Feb 18, 2026
