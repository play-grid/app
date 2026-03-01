# Stat Clash — Technical Specification

---

## Architectural Decisions

### Decision 1: No Circular Dependencies

Following ADR 002, this game package introduces zero new path mappings to source files.

**Rules:**
- `packages/games/stat-clash` does NOT import from `packages/api-client`
- `packages/games/stat-clash` does NOT import from `apps/api`
- The effect handler receives an injected `httpClient: HttpClient` (interface) — it does not construct one
- API routes for stat items define their own schemas — they do NOT import from `packages/games/stat-clash`

```typescript
// ✅ CORRECT: Effect receives injected client, no direct import of api-client
export function createFetchStatItemsEffect(
  httpClient: HttpClient  // injected by adapter/DO, not imported here
): GameEffect {
  return async (ctx) => {
    // Uses httpClient interface, not concrete implementation
  };
}

// ❌ WRONG (Five Seconds anti-pattern — do not repeat):
import hcWithType from '@playgrid/api-client'; // circular!
```

### Decision 2: Explicit Command Pattern (State ≠ Intent)

Effects are pure IO. The reducer makes all decisions. The UI dispatches explicit commands.

```
❌ State flag: { fetchInProgress: true }   ← intent in state
✅ Explicit action: dispatch({ type: 'REQUEST_STAT_ITEMS', ... })   ← intent as action
```

**Flow:**
```
UI dispatches START_GAME
UI dispatches REQUEST_STAT_ITEMS (explicit IO command)
  ↓
Effect: only does fetch, returns raw STAT_ITEMS_FETCHED
  ↓
Reducer: processes raw data, selects first pair, sets currentRound
```

No flags. No effect checking game phases. Effects do not know about business rules.

### Decision 3: Mode is a Setting, Not a Different Game

All four modes use the same `GameDefinition`, the same reducer, and the same action schemas. Mode differences are expressed as:

- `settings.mode: 'solo' | 'hotseat' | 'screen' | 'remote'`
- The adapter chosen at room creation time (Local vs Multiplayer)
- Additional state fields (`currentPlayerIndex`, `players` roster) active only in multi-player modes

### Decision 4: Display Client is Not a Player

In Screen Mode, the TV/display browser connects to the Durable Object but is tracked separately. It:
- Never appears in `state.players`
- Never receives a turn
- Only subscribes to state broadcasts
- Is identified by `role: 'display'` in the WebSocket handshake

### Decision 5: Client-Side Pair Selection

Pair selection runs entirely on the client (in the reducer / `pair-selector.ts`). The server's only job is to provide the pool of approved items.

The Durable Object in multiplayer mode runs the same reducer — so the pair selection logic is identical in both modes with no duplication.

### Decision 6: No Game-Specific Server Routes

There are no `/api/games/stat-clash/*` routes. Stat Clash needs nothing game-specific on the server beyond the data endpoint. Room creation, joining, WebSocket connections, and Durable Object management are all handled by the existing generic `/api/game-room/*` infrastructure.

---

## Package Structure

```
packages/games/stat-clash/
├── src/
│   ├── definition.ts              # GameDefinition + registerGame
│   ├── types.ts                   # Re-exports for consumers
│   ├── logic/
│   │   ├── schema.ts              # State & action schemas (Zod)
│   │   ├── reducer.ts             # Pure reducer (all modes)
│   │   ├── initial-state.ts       # Factory: createInitialState(mode, players)
│   │   ├── validator.ts           # Action validation
│   │   ├── effect-handlers.ts     # Fetch stat items (IO only, injected client)
│   │   ├── pair-selector.ts       # Pair selection + difficulty filtering
│   │   ├── difficulty-thresholds.ts # Category thresholds + progression
│   │   └── turn-manager.ts        # Turn rotation helpers (pure functions)
│   ├── hooks/
│   │   ├── use-stat-clash-state.ts
│   │   └── use-stat-clash-actions.ts
│   └── logger.ts
├── package.json
└── tsconfig.json
```

**Dependency rules (enforced):**
- ✅ May import from `@playgrid/game-core`
- ✅ May import from `zod`, `immer`
- ❌ Must NOT import from `@playgrid/api-client`
- ❌ Must NOT import from `apps/api`
- ❌ Must NOT path-map to any source file outside this package

---

## Game State Schema

```typescript
// packages/games/stat-clash/src/logic/schema.ts

export const StatClashSettingsSchema = z.object({
  mode: z.enum(['solo', 'hotseat', 'screen', 'remote']),
  category: z.enum(['companies', 'football', 'countries', 'mixed']),
  metricType: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimit: z.number().optional(),
  streakGoal: z.number().optional(),
  roundsPerPlayer: z.number().default(10),
});

export const StatClashPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number().default(0),
  streak: z.number().default(0),
  maxStreak: z.number().default(0),
  roundsPlayed: z.number().default(0),
  isHost: z.boolean().default(false),
  role: z.enum(['player', 'display']).default('player'),
});

export const StatClashGameStateSchema = BaseGameStateSchema.extend({
  phase: z.enum(['lobby', 'playing', 'results']),
  settings: StatClashSettingsSchema,
  players: z.record(z.string(), StatClashPlayerSchema),

  // Turn management (used in hotseat/screen/remote)
  playerOrder: z.array(z.string()).default([]),
  currentPlayerId: z.string().nullable().default(null),

  currentRound: StatClashRoundSchema.nullable().default(null),

  // Solo convenience fields (mirrors currentPlayer's stats in solo mode)
  streak: z.number().default(0),
  score: z.number().default(0),

  recentRounds: z.array(StatClashHistoryItemSchema).default([]),
  availableItems: z.array(StatItemSchema).default([]),
  usedItemIds: z.array(z.string()).default([]),

  error: z.object({
    message: z.string(),
    canRetry: z.boolean(),
  }).nullable().default(null),

  createdAt: z.number(),
  lastActivityAt: z.number(),
});
```

---

## Action Schemas

```typescript
export const StartGameActionSchema = z.object({
  type: z.literal('START_GAME'),
  payload: StatClashSettingsSchema,
});

// Explicit IO command — UI dispatches this, effect responds
export const RequestStatItemsActionSchema = z.object({
  type: z.literal('REQUEST_STAT_ITEMS'),
  payload: z.object({
    category: z.string().optional(),
    metricType: z.string().optional(),
    limit: z.number().optional(),
  }),
});

// Raw data returned from effect
export const StatItemsFetchedActionSchema = z.object({
  type: z.literal('STAT_ITEMS_FETCHED'),
  payload: z.object({
    items: z.array(z.any()),
    error: z.string().optional(),
  }),
});

// playerId carried for server-side turn validation
export const GuessHigherActionSchema = z.object({
  type: z.literal('GUESS_HIGHER'),
  payload: z.object({
    direction: z.enum(['left', 'right']),
    playerId: z.string(),
  }),
});

export const GameOverActionSchema = z.object({
  type: z.literal('GAME_OVER'),
  payload: z.object({
    finalStreak: z.number(),
    finalScore: z.number(),
    reason: z.enum(['wrong_guess', 'time_out', 'manual', 'pool_exhausted']),
  }),
});

export const StatClashErrorActionSchema = z.object({
  type: z.literal('STAT_CLASH_ERROR'),
  payload: z.object({
    message: z.string(),
    canRetry: z.boolean(),
  }),
});

// Multiplayer-only actions
export const JoinAsDisplayActionSchema = z.object({
  type: z.literal('JOIN_AS_DISPLAY'),
  payload: z.object({ displayToken: z.string() }),
});

export const AddHotseatPlayerActionSchema = z.object({
  type: z.literal('ADD_HOTSEAT_PLAYER'),
  payload: z.object({ name: z.string() }),
});

export const RemoveHotseatPlayerActionSchema = z.object({
  type: z.literal('REMOVE_HOTSEAT_PLAYER'),
  payload: z.object({ playerId: z.string() }),
});
```

---

## Reducer Responsibilities by Mode

The single reducer handles all modes. Mode-specific branches are clearly labeled:

```typescript
case 'GUESS_HIGHER': {
  // Common: evaluate guess for current player
  const playerId = action.payload.playerId;
  const player = draft.players[playerId];
  // ... compute correct/wrong, update player.streak, player.score ...

  // Mode branch: turn rotation
  if (draft.settings.mode !== 'solo') {
    const nextPlayerId = getNextPlayer(draft.playerOrder, playerId, draft.players);
    draft.currentPlayerId = nextPlayerId;

    if (isGameComplete(draft)) {
      draft.phase = 'results';
      draft.currentRound = null;
      break;
    }
  } else {
    // Solo: mirror player stats to top-level convenience fields
    draft.streak = player.streak;
    draft.score = player.score;
    if (!correct) {
      draft.phase = 'results';
      draft.currentRound = null;
      break;
    }
  }

  // Select next pair (same for all modes)
  const nextPair = selectPair(draft.availableItems, { ... });
  draft.currentRound = nextPair ? buildRound(nextPair, draft.settings) : null;
  if (!nextPair) draft.phase = 'results';
}
```

---

## Pair Selection Algorithm

### Core: Percentage Difference

```
percentDiff = |a.value - b.value| / max(a.value, b.value)
```

Examples:
```
Apple market cap: 3,900B  vs  Nvidia: 3,100B  → diff = 20.5%  → medium
Messi goals:      700      vs  Ronaldo: 850    → diff = 17.6%  → medium
India population: 1.4B     vs  China: 1.48B   → diff = 5.4%   → hard
Apple employees:  164,000  vs  Google: 182,000 → diff = 9.9%   → hard
```

### Category-Aware Thresholds

```typescript
// packages/games/stat-clash/src/logic/difficulty-thresholds.ts

export const DIFFICULTY_THRESHOLDS: Record<string, DifficultyThresholds> = {
  football: { easy: 0.40, medium: 0.15 },
  companies: { easy: 0.60, medium: 0.25 },
  countries: { easy: 0.70, medium: 0.30 },
  mixed:     { easy: 0.50, medium: 0.20 },
  default:   { easy: 0.50, medium: 0.20 },
};

export function getThresholds(category: string): DifficultyThresholds {
  return DIFFICULTY_THRESHOLDS[category] ?? DIFFICULTY_THRESHOLDS.default;
}
```

Hard = percentDiff below medium threshold. Medium = between medium and easy. Easy = above easy threshold.

### Difficulty Progression

```typescript
export function getEffectiveDifficulty(
  baseDifficulty: 'easy' | 'medium' | 'hard',
  streak: number,
): 'easy' | 'medium' | 'hard' {
  if (streak >= 10) return 'hard';
  if (streak >= 5) {
    if (baseDifficulty === 'easy') return 'medium';
    return 'hard';
  }
  return baseDifficulty;
}
```

### Full selectPair Function

```typescript
// packages/games/stat-clash/src/logic/pair-selector.ts

export interface PairSelectionConfig {
  category: string;
  metricType?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  streak: number;
  excludeIds: string[];
}

export function selectPair(
  items: StatItem[],
  config: PairSelectionConfig,
): [StatItem, StatItem] | null {

  // Step 1: Filter out used items
  const available = items.filter(item => !config.excludeIds.includes(item.id));

  // Step 2: Filter by metricType if specified
  const pool = config.metricType
    ? available.filter(item => item.metricType === config.metricType)
    : available;

  if (pool.length < 2) return null;

  // Step 3: Determine effective difficulty
  const effectiveDifficulty = getEffectiveDifficulty(config.difficulty, config.streak);
  const thresholds = getThresholds(config.category);

  // Step 4: Reservoir sampling — O(1) memory, one pass
  const target = samplePairsByDifficulty(pool, effectiveDifficulty, thresholds);

  if (!target) return null;

  // Step 5: Randomise left/right position
  return Math.random() > 0.5
    ? [target[0], target[1]]
    : [target[1], target[0]];
}

function samplePairsByDifficulty(
  pool: StatItem[],
  difficulty: 'easy' | 'medium' | 'hard',
  thresholds: DifficultyThresholds,
): [StatItem, StatItem] | null {
  let selected: [StatItem, StatItem] | null = null;
  let count = 0;

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i];
      const b = pool[j];
      const diff = percentDiff(a.value, b.value);

      if (!matchesDifficulty(diff, difficulty, thresholds)) continue;

      count++;
      if (Math.random() < 1 / count) {
        selected = [a, b];
      }
    }
  }

  if (!selected) {
    selected = fallbackPair(pool);
  }

  return selected;
}

function percentDiff(a: number, b: number): number {
  const max = Math.max(Math.abs(a), Math.abs(b));
  if (max === 0) return 0;
  return Math.abs(a - b) / max;
}

function matchesDifficulty(
  diff: number,
  difficulty: 'easy' | 'medium' | 'hard',
  t: DifficultyThresholds,
): boolean {
  switch (difficulty) {
    case 'easy':   return diff >= t.easy;
    case 'medium': return diff >= t.medium && diff < t.easy;
    case 'hard':   return diff < t.medium;
  }
}

function fallbackPair(pool: StatItem[]): [StatItem, StatItem] | null {
  if (pool.length < 2) return null;
  const i = Math.floor(Math.random() * pool.length);
  let j = Math.floor(Math.random() * (pool.length - 1));
  if (j >= i) j++;
  return [pool[i], pool[j]];
}
```

**Why reservoir sampling:** Avoids O(n²) memory. With 80 items, ~3,160 pair iterations — all arithmetic, sub-millisecond. O(1) memory regardless of pool size.

---

## Effect Handler

```typescript
// packages/games/stat-clash/src/logic/effect-handlers.ts
// Receives injected httpClient — does NOT import api-client directly

export function createFetchStatItemsEffect(
  httpClient: HttpClient
): GameEffect {
  return async (ctx): Promise<StatItemsFetchedAction | null> => {
    if (ctx.action.type !== 'REQUEST_STAT_ITEMS') return null;

    try {
      const { category, metricType, limit = 80 } = ctx.action.payload;
      const params = new URLSearchParams({ status: 'approved', limit: String(limit) });
      if (category && category !== 'mixed') params.set('category', category);
      if (metricType) params.set('metricType', metricType);

      const data = await httpClient.get(`/api/data/stat-items?${params}`);

      return {
        type: 'STAT_ITEMS_FETCHED',
        payload: { items: data.items ?? [] },
      };
    } catch (error) {
      return {
        type: 'STAT_ITEMS_FETCHED',
        payload: { items: [], error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  };
}
```

---

## Validator

```typescript
// packages/games/stat-clash/src/logic/validator.ts

// Reject GUESS_HIGHER if it's not this player's turn
if (parsedAction.type === 'GUESS_HIGHER') {
  if (state.settings.mode !== 'solo' &&
      state.currentPlayerId !== parsedAction.payload.playerId) {
    return { valid: false, reason: 'Not your turn' };
  }
}

// Reject JOIN_AS_DISPLAY if display is already connected
if (parsedAction.type === 'JOIN_AS_DISPLAY') {
  const displayAlreadyConnected = Object.values(state.players)
    .some(p => p.role === 'display');
  if (displayAlreadyConnected) {
    return { valid: false, reason: 'Display already connected' };
  }
}
```

---

## Game Definition

```typescript
// packages/games/stat-clash/src/definition.ts
// No api-client import. No path mapping to apps/api source.

export const statClashGame = createGameDefinition({
  meta: {
    id: 'stat-clash',
    version: '1.0.0',
    name: { en: 'Stat Clash', ar: 'صراع الأرقام' },
    description: {
      en: 'Guess which item has the higher value. Play solo, with friends on one screen, or remotely!',
      ar: 'خمّن أي عنصر له قيمة أعلى. العب وحدك أو مع أصدقائك!',
    },
    imageUrl: '/assets/games/stat-clash/thumbnail.jpg',
    minPlayers: 1,
    maxPlayers: 8,
    supportedModes: ['solo', 'hotseat', 'screen', 'remote'],
  },
  stateSchema: StatClashGameStateSchema,
  actionSchema: StatClashActionSchema,
  initialState: createInitialState('', 'Player', 'solo'),
  initialStateFactory: createInitialState,
  validator: validateStatClashAction,
  customReducer: statClashReducer,
});

registerGame(statClashGame, (httpClient) => [
  createFetchStatItemsEffect(httpClient),
]);
```

---

## API Routing

### The Principle

`/api/data/*` — pure data, CDN-cacheable, no game logic, no session state, reusable by any game.

`/api/game-room/*` — game-agnostic multiplayer infrastructure, already exists, used by Five Seconds today. Stat Clash uses it as-is. No game-specific server routes exist for Stat Clash.

```
/api/data/stat-items     ← Pure. Returns approved items. Knows nothing about games.
/api/data/players        ← Pure. Returns player entities.
/api/data/teams          ← Pure. Returns team entities.

/api/game-room           ← Game-agnostic. Already exists.
/api/game-room/:id/ws    ← WebSocket upgrade → Durable Object
```

### `/api/data/stat-items` Spec

```
GET /api/data/stat-items

Query params:
  category     string?   'football' | 'companies' | 'countries' | 'mixed'
  metricType   string?   'goals' | 'market-cap' | 'population' | ...
  status       string    default: 'approved'
  limit        number    default: 50, max: 80
  lang         string    default: 'en'  ('en' | 'ar')

Response:
  { items: StatItem[], total: number }

Cache-Control: public, max-age=3600
```

### What Does NOT Get an API Endpoint

| Thing | Where it lives | Why |
|---|---|---|
| Pair selection | `pair-selector.ts` in reducer | Pure function, no IO needed |
| Difficulty algorithm | `difficulty-thresholds.ts` | Pure function |
| Turn rotation | `turn-manager.ts` in reducer | Pure function |
| Used item tracking | `state.usedItemIds` | Game state |
| Score calculation | `reducer.ts` | Pure function |

---

## Durable Object: Display Client Addition

The only server-side change needed for Stat Clash is adding `role=display` WebSocket support to the existing `GameSessionObject`.

### Changes to `game-session.object.ts`

**1. Add `displayConnections` set:**
```typescript
private displayConnections = new Set<WebSocket>();
```

**2. Add `role=display` branch in `handleWebSocketUpgrade`:**
```typescript
const role = url.searchParams.get('role') ?? 'player';

if (role === 'display') {
  const state = this.manager!.getState() as any;
  if (state.settings?.mode !== 'screen') {
    return new Response('Display role only allowed in screen mode', { status: 403 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  this.ctx.acceptWebSocket(server);
  this.displayConnections.add(server);

  server.send(JSON.stringify({ type: 'onStateUpdate', payload: this.manager!.getState() }));
  return new Response(null, { status: 101, webSocket: client });
}
// ... existing player path unchanged below ...
```

**3. Block display clients from dispatching actions in `webSocketMessage`:**
```typescript
if (this.displayConnections.has(ws)) {
  logger.warn('[GameSessionObject] Display client attempted to send action — ignored');
  return;
}
```

**4. Clean up on close in `webSocketClose`:**
```typescript
if (this.displayConnections.has(ws)) {
  this.displayConnections.delete(ws);
  logger.info('[GameSessionObject] Display client disconnected');
}
```

**Note:** `broadcastState()` already uses `this.ctx.getWebSockets()` which returns all accepted WebSockets. Display clients receive state broadcasts automatically — no change needed to `GameSessionManager`.

### How the TV Connects (Screen Mode)

```typescript
// apps/frontend/src/games/stat-clash/components/display/DisplayView.tsx

const roomCode = useParams().code;
const ws = new WebSocket(`wss://api.playgrid.app/api/game-room/${roomCode}/ws?role=display`);
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'onStateUpdate') setGameState(msg.payload);
};
// Display never sends any messages — pure receiver
```

No join flow, no credentials, no playerId.

---

## Complete Data Flow

### Session Start (Solo / Hotseat)

```
1. User picks category=football, metricType=goals, difficulty=easy
2. UI dispatches START_GAME { settings }
3. UI dispatches REQUEST_STAT_ITEMS { category: 'football', metricType: 'goals', limit: 80 }
4. Effect: GET /api/data/stat-items?category=football&metricType=goals&status=approved&limit=80
5. Server returns ~60 approved items
6. STAT_ITEMS_FETCHED → Reducer stores items
7. Reducer calls selectPair(items, { difficulty: 'easy', streak: 0, excludeIds: [] })
   → percentDiff >= 0.40 for football/easy
   → picks pair: [Messi 500 goals, Neymar 100 goals] (80% diff, clearly easy)
8. currentRound set, UI renders
```

### Each Subsequent Round

```
1. User guesses LEFT or RIGHT
2. GUESS_HIGHER → Reducer
   → evaluates correct/wrong
   → streak++ (or 0 if wrong)
   → adds both item IDs to usedItemIds
   → calls selectPair(items, { difficulty: 'easy', streak: 3, excludeIds: [used...] })
   → getEffectiveDifficulty('easy', 3) → still 'easy'
3. If streak reaches 5: getEffectiveDifficulty('easy', 5) → 'medium'
   → next pair must have 15–40% diff for football
4. If pool exhausted: phase → 'results' with "You beat the category!" reason
```

### Session Start (Screen Mode / Remote — Multiplayer)

```
1. Host: POST /api/game-room { gameType: 'stat-clash', maxPlayers: N, hostPlayerName: '...' }
   → Durable Object created, returns roomId (7-digit) + credentials
2. Players join: POST /api/game-room/:id/join { playerName: '...', inviteToken: '...' }
   → Returns credentials for WebSocket auth
3. Players connect: WS /api/game-room/:id/ws?playerId=...&credentials=...
4. TV connects:     WS /api/game-room/:id/ws?role=display  (no credentials needed)
5. Host dispatches START_GAME from phone
6. UI also dispatches REQUEST_STAT_ITEMS
7. Effect runs server-side: fetches from /api/data/stat-items
8. STAT_ITEMS_FETCHED → Reducer → selectPair → currentRound set
9. State broadcast to all clients (phones + TV display)
```

The Durable Object runs the same reducer and the same `selectPair` function as the local adapter. No duplication. The algorithm is fully portable.

---

## What Does NOT Change in Existing Infrastructure

| Thing | Status | Reason |
|---|---|---|
| `GameSessionManager` | Unchanged | Game-agnostic, handles everything |
| `game-room.handlers.ts` `create` | Unchanged | Works for screen and remote as-is |
| `game-room.handlers.ts` `join` | Unchanged | Works for screen and remote as-is |
| `game-room.handlers.ts` `websocketUpgrade` | Unchanged | Credential validation still correct |
| `game-room.routes.ts` | Unchanged | No new HTTP endpoints needed |
| `initGameSessionSchema` | Unchanged | `mode` lives in game `settings`, not room config |
| Room ID generation | Unchanged | 7-digit code works fine |
| Invite token system | Unchanged | Works for screen and remote |

---

## Consequences

### Positive
- Four modes from one `GameDefinition` and one reducer
- Zero new circular dependencies (injected httpClient, no path-to-source mappings)
- Explicit command pattern: effects are trivial IO, reducer owns all logic
- No API round-trip per round — pair selection is instant, fully local
- CDN-cacheable data endpoint — no session state
- Algorithm is testable — pure functions, no mocking needed
- Category-aware thresholds — football and market caps use appropriate difficulty scales
- Difficulty progression — game naturally gets harder as streak grows
- No repeat entities — `usedItemIds` guarantee per session
- Clean API boundary — no game-specific server routes at all
- Reservoir sampling — O(1) memory for pair selection
- Display client role cleanly separated from player roster
- Total server-side work: ~50 lines of new code in one file

### Negative
- Hotseat requires pass-device UX care (clear "your turn" signal)
- Screen Mode needs QR code + room code generation on frontend
- Four modes increase UI surface area significantly
- Thresholds need playtesting — treated as configurable constants, not hardcoded logic
- Mixed mode difficulty is approximate (one threshold for all entity types)
- Pool exhaustion is terminal — ~30 pairs max per session by design
- Five Seconds mixed-effect pattern remains as technical debt (not fixed here)

### Risks
- Display client reconnection edge cases in Screen Mode
- Item approval pipeline must be complete before launch (currently 0 approved items)