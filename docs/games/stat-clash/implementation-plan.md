# Stat Clash — Implementation Plan

---

## Mode Boundaries

Before starting, confirm which infrastructure each mode touches:

```
Solo      → LocalAdapter only. Server never involved. No game-room routes called.
Hotseat   → LocalAdapter only. Server never involved. No game-room routes called.
Screen    → MultiplayerAdapter. Uses existing /api/game-room routes + display WS addition.
Remote    → MultiplayerAdapter. Uses existing /api/game-room routes. Zero server changes.
```

---

## Package File Structure

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

```
apps/frontend/src/games/stat-clash/
├── components/
│   ├── lobby/
│   │   ├── ModeSelector.tsx          # Choose Solo / Hotseat / Screen / Remote
│   │   ├── HotseatSetup.tsx          # Add players for hotseat
│   │   ├── RoomCreate.tsx            # Create room (screen/remote modes)
│   │   └── RoomJoin.tsx              # Join room via code
│   ├── game/
│   │   ├── GameBoard.tsx             # Main board (two item cards)
│   │   ├── ItemCard.tsx              # One comparison item
│   │   ├── GuessButtons.tsx          # Left / Right buttons
│   │   ├── StreakBar.tsx             # Current streak display
│   │   ├── TurnIndicator.tsx         # "Your turn" / "Waiting for X..."
│   │   └── PlayerScoreboard.tsx      # All players' scores (multi-player)
│   ├── display/
│   │   └── DisplayView.tsx           # TV display client (Screen Mode)
│   └── results/
│       └── GameOverScreen.tsx
└── hooks/
    ├── use-stat-clash-state.ts
    └── use-stat-clash-actions.ts
```

```
apps/api/src/routes/
├── data/
│   └── stat-items/                   # Pure data endpoint, CDN-cacheable (already exists)
└── game-room/                        # Already exists. Game-agnostic. No changes for Stat Clash.
```

```
apps/api/src/durable-objects/game-session/
└── game-session.object.ts            # 4 small additions for display client support
```

---

## Frontend Routing

- `/game/stat-clash/room/:code/display` → connects as `role: 'display'`, renders `DisplayView`
- `/game/stat-clash/room/:code` → connects as player, renders standard game UI
- `/game/stat-clash/join` → QR code target, redirects to room join flow

---

## Hooks

```typescript
// packages/games/stat-clash/src/hooks/use-stat-clash-actions.ts

export function useStatClashActions() {
  const adapter = useGameAdapter();

  const startGame = useCallback(
    (settings: StartGameAction['payload']) => {
      adapter.dispatch({ type: 'START_GAME', payload: settings });
      // UI explicitly dispatches the fetch command — no state flags
      adapter.dispatch({
        type: 'REQUEST_STAT_ITEMS',
        payload: {
          category: settings.category,
          metricType: settings.metricType,
          limit: 80,
        },
      });
    },
    [adapter]
  );

  const guessHigher = useCallback(
    (direction: 'left' | 'right') => {
      return adapter.dispatch({
        type: 'GUESS_HIGHER',
        payload: { direction },
      });
    },
    [adapter]
  );

  return { startGame, guessHigher };
}
```

---

## Phase 1: Core Game Logic (3–4 hrs)

1. `schema.ts` — state + all action schemas
2. `difficulty-thresholds.ts` — `DIFFICULTY_THRESHOLDS`, `getThresholds()`, `getEffectiveDifficulty()`
3. `pair-selector.ts` — `selectPair()`, `samplePairsByDifficulty()`, `fallbackPair()`
4. `turn-manager.ts` — `getNextPlayer()`, `isGameComplete()` (pure functions)
5. `reducer.ts` — all modes in one file, mode branches clearly labeled
6. `initial-state.ts` — factory per mode
7. Unit tests for reducer covering all four modes

**Deliverable:** Game logic works entirely offline with mock data. No server needed.

---

## Phase 2: Effects & API Route (2 hrs)

1. `effect-handlers.ts` — inject `httpClient`, no direct api-client import
2. Verify `apps/api/src/routes/data/stat-items/` exists with correct schema (own schemas, no import from game package)
3. `validator.ts` — schema validation + turn validation for multiplayer

**Deliverable:** `REQUEST_STAT_ITEMS` → fetch → `STAT_ITEMS_FETCHED` → reducer works end-to-end.

---

## Phase 3: Game Registration (1 hr)

1. `definition.ts` — wire together all logic, `registerGame` with injected httpClient
2. Register in `apps/api` game registry
3. Smoke test via local adapter: start solo game, fetch items, play a round

**Deliverable:** Solo mode works in browser end-to-end.

---

## Phase 4: Frontend — Solo + Hotseat (4–5 hrs)

1. `ModeSelector` — choose between all four modes
2. `HotseatSetup` — add/remove players before game start
3. `GameBoard`, `ItemCard`, `GuessButtons` — core game UI
4. `StreakBar`, `GameOverScreen`
5. `PlayerScoreboard` — visible in hotseat, shows all players' scores
6. Hotseat turn rotation UI — clear "your turn" signal when passing device

**Deliverable:** Solo and Hotseat fully playable.

---

## Phase 5: Server — Display Client Support (0.5 hrs)

Four small additions to `game-session.object.ts`:

1. Add `private displayConnections = new Set<WebSocket>()`
2. Add `role=display` branch in `handleWebSocketUpgrade` (before existing player logic)
3. Add early return in `webSocketMessage` if sender is a display connection
4. Add display connection cleanup in `webSocketClose`

**Note:** `GameSessionManager.broadcastState()` uses `this.ctx.getWebSockets()` which already returns all accepted WebSockets. Display clients receive broadcasts automatically — no change to `GameSessionManager`.

**Deliverable:** TV can connect to any screen-mode room and receive state updates.

---

## Phase 6: Frontend — Screen + Remote Multiplayer (4–5 hrs)

1. `RoomCreate` — POST to `/api/game-room`, show room code + QR code
2. `RoomJoin` — join flow via room code or invite link
3. `TurnIndicator` — "Your turn!" vs "Waiting for [name]..."
4. `DisplayView` — TV client, connects via `?role=display`, pure state receiver, never sends
5. Phone-specific layout for Screen Mode controllers (large Left/Right buttons, minimal chrome)
6. WebSocket reconnection handling

**Deliverable:** Screen Mode and Remote Mode fully playable.

---

## Phase 7: Polish (2–3 hrs)

1. Animations — reveal transition (value slides in), correct/wrong feedback flash
2. Responsive design — phone-first for Screen Mode controllers
3. Accessibility audit
4. E2E test for each mode
5. Performance check on pair selection with real data

**Total estimated time: 16–20 hours**

---

## Server-Side Work Summary

Total new server code for Stat Clash: **~50 lines in one file** (`game-session.object.ts`).

Everything else in the API — `GameSessionManager`, all `game-room` handlers, routes, schemas, invite tokens, credential validation — is untouched.

| File | Change |
|---|---|
| `game-session.object.ts` | 4 small additions (display client) |
| `packages/games/stat-clash/` | New package — all game logic |
| `apps/api/src/routes/data/stat-items/` | Already exists — verify schema, no changes expected |
| Everything else in `apps/api/` | Untouched |