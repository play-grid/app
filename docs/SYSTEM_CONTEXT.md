# PlayGrid System Context

## Architecture Overview

PlayGrid is a multiplayer-capable game platform built as a monorepo. It separates game logic (pure reducers), networking (adapters), and UI (React) into distinct layers, supporting both **local (client-authoritative)** and **multiplayer (server-authoritative)** modes.

**Three-Tier Stack:**
- **Frontend** (`apps/frontend`): React UI, abstracted via Game Adapter
- **Shared Logic** (`packages/game-core` + `packages/games`): Game definitions, reducers, schemas
- **Backend** (`apps/api`): Cloudflare Workers + Durable Objects (multiplayer authority)

---

## Core Concepts

### Pure Reducers

All game state transitions use deterministic, side-effect-free reducers:

```
reducer(currentState, action) → newState
```

**Properties:**
- **Deterministic**: Same input always produces same output
- **Testable**: Easy to unit test without network/database dependencies
- **Portable**: Same reducer runs in both local and multiplayer modes

The same reducer runs in both local and multiplayer modes—only the adapter differs.

### Game Definition

Every game registers with a `GameDefinition` containing:

- **Meta**: Game ID, version, name, description, player count limits
- **State Schema** (Zod): Defines valid game state shape
- **Action Schema** (Zod): Defines valid actions
- **Reducer**: Pure function transforming state
- **Initial State**: Default game state
- **Validator**: Custom action validation logic (optional)
- **Effect Handler Factory**: Creates side effect handlers (optional)

The **game-core package** provides foundational logic shared by all games and MUST remain game-agnostic (see [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md)):

- Player roster management
- Turn progression
- Phase lifecycle (lobby → playing → results)
- Winner determination
- Session management
- Player disconnection handling

Individual games extend this with custom rules.

---

## Execution Modes

### Local Mode (Client-Authoritative)

- Reducer runs entirely on client (Zustand store)
- Instant feedback, no network latency
- Effect handlers optional (can use TanStack Query for caching)
- **Flow:** UI → Adapter → Reducer → Local State → UI Re-render

### Multiplayer Mode (Server-Authoritative)

- Actions sent via WebSocket to Durable Object
- Server validates action through schema, then reducer, then broadcast
- Clients may use optimistic updates, reconcile when server state arrives
- **Flow:** UI → Adapter → WebSocket → Durable Object (Validation + Reducer) → Broadcast → All Clients Reconcile

---

## Side Effects System

Effects handle asynchronous operations *after* the reducer updates state. They run on the server in multiplayer mode, and can be client-side (or use TanStack Query) in local mode.

**Effect Handler Contract:**
- **Input**: Previous action, new state, HTTP client, context
- **Output**: Follow-up action (or null)
- **Execution**: After reducer, async, non-blocking

**Example:**
After `NEXT_ROUND` is committed, a fetch-questions effect runs, hits the API, and returns a `LOAD_QUESTIONS` action. That action goes through validation again and the reducer runs once more, adding questions to state. State is broadcast to all clients.

**Current Implementation:**
- Five Seconds game uses effects to fetch questions from the API
- HTTP client is injected via dependency injection (see [ADR 002: Breaking Circular Dependencies](../decisions/002-break-circular-dependencies.md))

---

## Game Adapter (Abstraction Layer)

The Game Adapter abstracts whether the reducer runs locally or on the server. Both modes share identical React code.

**Local Adapter:**
- Reducer runs in the browser
- Manages Zustand store
- Executes effect handlers
- `dispatch` always async for consistency

**Multiplayer Adapter:**
- Sends actions via WebSocket
- Receives authoritative state from the server
- Handles optimistic updates and reconciliation
- Manages reconnection and session rehydration

**Interface (same for both):**
```
getState() → GameState
dispatch(action) → Promise<void>
subscribe(listener) → Unsubscribe
```

---

## Durable Object: Server Authority

A Durable Object represents one game room. It persists state, validates actions, runs the reducer, executes effects, and broadcasts updates to all connected clients.

**Responsibilities:**
- Hold and persist game state (survives server reboots)
- Apply validation to incoming actions
- Execute reducer only after all checks pass
- Run effect handlers asynchronously
- Broadcast authoritative state to all connected WebSocket clients
- Track connected players and handle reconnection

The Durable Object is the single source of truth in multiplayer mode.

---

## Game Registration & Structure

### packages/game-core

**Foundational Logic:**
- Player management
- Turn order
- Phase lifecycle
- Game lifecycle
- Disconnection handling

**Base Types:**
- `BaseAction`
- `BaseGameState`
- `GameMeta`
- `GameDefinition`

**Core Components:**
- Adapter implementations (local and multiplayer)
- Effect type contracts
- Game registry system

### packages/games/[game-name]

**Game-Specific Components:**
- Extends core with game-specific state schema and action schema
- Implements custom reducer (turns core logic into game rules)
- Optionally implements custom effect handlers
- Exports `GameDefinition` for registration

### apps/api (Durable Object)

**Multiplayer Infrastructure:**
- Hosts game room instances
- Applies validation to incoming actions
- Executes registered reducers and effects
- Manages WebSocket connections
- Persists state via Durable Object storage

### apps/frontend

**User Interface:**
- Consumes `GameDefinition`
- Instantiates appropriate adapter (local or multiplayer)
- Renders React UI using adapter's `dispatch` and `getState`
- Uses TanStack Query for data fetching and caching

---

## Data Flow Summary

### Local Mode
```
Action
  ↓
Adapter
  ↓
Reducer
  ↓
Zustand
  ↓
Effects (optional)
  ↓
Follow-up Action
  ↓
Zustand
  ↓
UI Re-render
```

### Multiplayer Mode
```
Action
  ↓
Adapter
  ↓
WebSocket
  ↓
Durable Object
  ├─ Validation
  ├─ Reducer
  └─ Effects
  ↓
Broadcast
  ↓
All Clients Reconcile
  ↓
UI Re-render
```

---

## Key Design Principles

1. **Pure Reducers:** No side effects in state logic; effects are separate
2. **Server Authority (Multiplayer):** Client cannot change state unilaterally; server always wins
3. **Extensibility:** Games are pluggable extensions to the core framework
4. **Code Reuse:** Reducer logic is identical in local and multiplayer; only the adapter differs
5. **Dependency Injection:** Infrastructure concerns (HTTP client, WebSocket) are injected, not imported directly

---

## Implementation Status

### ✅ Implemented

- **Pure reducers and game definitions**
- **Local and multiplayer adapters**
- **WebSocket communication and Durable Objects**
- **Side effects system with dependency injection**
- **Core game logic** (players, turns, phases)
- **Game registration system**
- **TanStack Query integration** (frontend data fetching)
- **Schema validation** for actions

### 🔄 In Progress

- **Breaking circular dependencies** (see [ADR 002: Breaking Circular Dependencies](../decisions/002-break-circular-dependencies.md) and [Implementation Plan](../refactoring/002-implementation-plan.md))

---

## Related Documentation

- [Architecture Overview v2](./monorepo-structure-v2.md) - Detailed package structure and dependencies
- [Quick Reference](./quick-reference.md) - Developer patterns and code examples
- [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md) - Rule that game-core must not contain game-specific logic
- [ADR 002: Breaking Circular Dependencies](../decisions/002-break-circular-dependencies.md) - Current refactoring work
- [Dependency Comparison](./dependency-comparison.md) - Visual comparison of v1 vs v2 architecture

---

**Last Updated:** Feb 6, 2026
