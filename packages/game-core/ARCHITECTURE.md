# Multiplayer Game Architecture

## 🏗️ Architecture Overview

This architecture provides a seamless transition between **offline** and **online** multiplayer modes using:

- **Zustand** - Local game state management
- **XState** - State machine for network & game phases
- **oRPC** - Type-safe RPC communication
- **Durable Objects** - Server-side authoritative game state
- **PartySocket** - Automatic reconnection with exponential backoff

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT SIDE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   React UI   │  │  Game Proxy  │  │ Network Client  │  │
│  │  Components  │←→│  (Adapter)   │←→│    (oRPC)       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│         ↓                ↓                     ↓            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ React Hooks  │  │   Zustand    │  │   PartySocket   │  │
│  │              │  │    Store     │  │  (Auto Reconnect)│  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                          ↓                     ↓            │
│                    ┌──────────────┐  ┌─────────────────┐  │
│                    │   XState     │  │ Durable Iterator│  │
│                    │  (Network &  │  │   (Streaming)   │  │
│                    │   Game FSM)  │  └─────────────────┘  │
│                    └──────────────┘           ↓            │
└─────────────────────────────────────────────────────────────┘
                                                 ↓
                                          WebSocket (WSS)
                                                 ↓
┌─────────────────────────────────────────────────────────────┐
│                       SERVER SIDE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Cloudflare Durable Object                  │  │
│  │                                                        │  │
│  │  ┌────────────────┐  ┌──────────────┐               │  │
│  │  │ oRPC Handler   │  │  Game Store  │               │  │
│  │  │ (Procedures)   │→→│  (Zustand)   │               │  │
│  │  └────────────────┘  └──────────────┘               │  │
│  │         ↓                    ↓                        │  │
│  │  ┌────────────────┐  ┌──────────────┐               │  │
│  │  │ Event Pub/Sub  │  │   XState     │               │  │
│  │  │ (Broadcasting) │  │  (Game FSM)  │               │  │
│  │  └────────────────┘  └──────────────┘               │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Offline Mode

```
UI Component
    ↓ (action)
Game Proxy
    ↓ (local)
Zustand Store
    ↓ (update)
React Component (re-render)
```

### Online Mode

```
UI Component
    ↓ (action)
Game Proxy
    ↓ (optimistic update to local store)
    ↓ (RPC call via oRPC)
Network Client
    ↓ (WebSocket via PartySocket)
Durable Object
    ↓ (execute action on authoritative store)
    ↓ (broadcast event via Durable Iterator)
All Connected Clients
    ↓ (receive event)
    ↓ (update local store)
React Component (re-render)
```

---

## 🎮 XState Integration

### Network State Machine

```typescript
disconnected → connecting → connected
                     ↓           ↓
                   error ←───────┘
                     ↓
                reconnecting → connecting
```

**States:**
- `disconnected` - No connection established
- `connecting` - Attempting connection
- `connected` - Active connection
- `error` - Connection failed, attempting reconnect

### Game Phase State Machine

```typescript
lobby → playing → results
          ↓         ↓
        paused ─────┘
          ↓
      lobby (restart)
```

**States:**
- `lobby` - Waiting for players
- `playing` - Game in progress
- `paused` - Game temporarily paused
- `results` - Game finished

**Synchronization:**
- Server sends `phase_changed` events
- Client updates both Zustand store AND XState machine
- XState machine provides additional UI states (e.g., paused)

---

## 🔌 Network Client Features

### Automatic Reconnection (PartySocket)

```typescript
const networkClient = createNetworkClient({
  roomId: 'room-123',
  baseUrl: 'ws://localhost:3000',
  signingKey: 'secret-key',
  reconnectAttempts: Infinity,
  minReconnectDelay: 1000,
  maxReconnectDelay: 30000,
});
```

**Features:**
- Exponential backoff (1s → 1.3s → 1.69s → ... → 30s max)
- Infinite reconnection attempts by default
- Automatic WebSocket upgrade handling

### Event Streaming (Durable Iterator)

```typescript
for await (const event of networkClient.onStateUpdate()) {
  // Handle: state_update, player_joined, player_left, etc.
}
```

**Features:**
- Automatic event resumption after disconnect
- Event filtering by tags/targets
- Type-safe discriminated union events

---

## 🎯 Game Proxy (Core Adapter)

### Behavior

| Mode         | Action Handling                           |
|--------------|-------------------------------------------|
| `offline`    | Execute locally only                      |
| `connecting` | Queue actions (or execute locally)        |
| `online`     | Execute locally + forward to server       |
| `error`      | Fallback to local + attempt reconnect     |

### Optimistic Updates

```typescript
const gameProxy = createGameProxy(store, networkClient, {
  optimisticUpdates: true, // Apply locally first, sync later
});
```

**Benefits:**
- Instant UI feedback
- No waiting for server confirmation
- Automatic rollback on error (future enhancement)

---

## 📝 Zod as Source of Truth

### Type Flow

```typescript
// 1. Define Zod schema
const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ...
});

// 2. Infer TypeScript type
type Player = z.infer<typeof PlayerSchema>;

// 3. Use in contracts
export const addPlayerContract = oc
  .input(z.object({ /* ... */ }))
  .output(GameStateOutputSchema);

// 4. Client & server share exact types
```

**Benefits:**
- Single source of truth
- Runtime validation at network boundary
- Compile-time type safety in code
- No manual serialization

---

## 🚀 Usage Examples

### Basic Setup

```typescript
// 1. Create store
const store = createGameStore({
  name: 'my-game',
  initialSettings: { rounds: 3 },
  options: { maxPlayers: 4, turnBased: true },
});

// 2. Create network client (optional)
const networkClient = createNetworkClient({
  roomId: 'room-123',
  baseUrl: 'ws://localhost:3000',
  signingKey: 'secret-key',
});

// 3. Create proxy
const gameProxy = createGameProxy(store, networkClient, {
  autoSync: true,
  optimisticUpdates: true,
});

// 4. Use it!
await gameProxy.addPlayer({ id: 'p1', name: 'Alice' });
```

### React Hooks

```typescript
function MyComponent() {
  const { state, mode, isOnline } = useGameProxy(gameProxy);
  const { player, toggleReady, isHost } = usePlayerActions(gameProxy, 'player-1');
  const { startGame, isInLobby } = useGameLifecycle(gameProxy);

  return (
    <div>
      <p>Status: {mode}</p>
      {isInLobby && isHost && (
        <button onClick={startGame}>Start Game</button>
      )}
    </div>
  );
}
```

---

## 🔧 Server Implementation (Next Step)

To complete the system, implement the Durable Object:

```typescript
export class GameRoomDO extends DurableIteratorObject<GameEventType> {
  store = createGameStore({ /* ... */ });

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env, {
      signingKey: 'secret-key',
      resumeRetentionSeconds: 120,
    });
  }

  async addPlayer(input: any, ws: WebSocket) {
    // Execute on authoritative store
    this.store.getState().addPlayer(input);

    // Broadcast event
    this.publishEvent({
      type: 'player_joined',
      player: input,
      timestamp: Date.now(),
    });

    // Return updated state
    return this.store.getState();
  }

  // Implement other contracts...
}
```

---

## ✅ Benefits of This Architecture

1. **Seamless Offline/Online Transition**
   - Same API for both modes
   - No code changes required
   - Automatic reconnection handling

2. **Type Safety**
   - Zod validates at runtime
   - TypeScript enforces at compile-time
   - Shared types between client/server

3. **State Management**
   - XState for connection & phase logic
   - Zustand for game data
   - Clean separation of concerns

4. **Developer Experience**
   - Simple API surface
   - React hooks for easy integration
   - Debug logging built-in

5. **Performance**
   - Optimistic updates
   - Efficient event streaming
   - Minimal network overhead

---

## 🔜 Next Steps

1. ✅ **Contracts defined** (types + multiplayer)
2. ✅ **Network client created** (oRPC + PartySocket)
3. ✅ **Game proxy implemented** (offline/online adapter)
4. ✅ **React hooks provided** (easy integration)
5. 🔲 **Server implementation** (Durable Object + oRPC handler)
7. 🔲 **Testing suite** (unit + integration tests)

---

## 📚 References

- [oRPC Documentation](https://orpc.dev)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [XState](https://xstate.js.org/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [PartySocket](https://github.com/partykit/partykit)