# Problem: Inconsistent Sub-Phase Management Between Local and Online Modes

**Status:** Identified
**Date:** Feb 10, 2026
**Related Issues:** 
- [Problem Statement](./PROBLEM_STATEMENT.md) - Circular dependencies and architectural issues
- [System Context](./SYSTEM_CONTEXT.md) - Overview of execution modes

---

## Problem Description

The Five Seconds game implements sub-phase transitions (reading → answering → voting) using inconsistent patterns between local and online modes. This creates maintenance burden, bugs, and requires manual synchronization of logic across different execution environments.

### Current Implementation

#### Sub-Phases in Five Seconds Game

The game has a turn-level phase system:
```
pre-turn → reading → answering → voting → pre-turn (next player)
```

Each phase has different behavior:
- **pre-turn**: Shows who's up next, player clicks "Start Turn"
- **reading**: Displays question, waits calculated reading time
- **answering**: Player has `timePerTurn` seconds to answer
- **voting**: Other players vote if answer was valid

#### Local Mode Implementation

```typescript
// packages/games/five-seconds/src/logic/effect-handlers.ts

export function createTimerEffect(): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;

  return async (ctx: GameEffectContext): Promise<...> => {
    const action = ctx.action as FiveSecondsAction;
    const gameState = ctx.state as FiveSecondsGameState;
    const isServer = !!ctx.ctx?.storage;

    // Reading timer logic (LOCAL ONLY)
    if (action.type === 'START_TURN' && !isServer) {
      const readingDuration = gameState.readingTime * 1000;
      const currentDispatch = ctx.dispatch;

      // ❌ Manual setTimeout - inconsistent with server
      localTimerId = setTimeout(async () => {
        if (currentDispatch) {
          await currentDispatch({ type: 'START_ANSWERING' });
        }
        localTimerId = undefined;
      }, readingDuration);

      return {
        type: 'START_READING_TIMER',
        payload: { endsAt: Date.now() + readingDuration },
      };
    }

    // Answering timer logic (LOCAL ONLY)
    if (action.type === 'START_ANSWERING' && !isServer) {
      const turnDuration = gameState.settings.timePerTurn * 1000;
      const currentDispatch = ctx.dispatch;

      // ❌ Another manual setTimeout
      localTimerId = setTimeout(async () => {
        if (currentDispatch) {
          await currentDispatch({ type: 'TIMES_UP' });
        }
        localTimerId = undefined;
      }, turnDuration);

      return {
        type: 'START_TURN_TIMER',
        payload: { endsAt: Date.now() + turnDuration },
      };
    }
  };
}
```

#### Online Mode Implementation

```typescript
// apps/api/src/durable-objects/game-session/game-session.object.ts

export class GameSessionObject extends DurableObject<...> {
  // ❌ Generic alarm handler - must manually check which timer expired
  async alarm() {
    logger.debug('[GameSessionObject] Alarm triggered');
    await this.ensureInitialized();
    if (this.manager) {
      const state = this.manager.getState();
      const turnPhase = (state as any).turnState?.phase;
      const readingTimerEndsAt = (state as any).readingTimerEndsAt;
      const turnTimerEndsAt = (state as any).turnTimerEndsAt;

      // ❌ Manual phase checking - brittle and error-prone
      if (turnPhase === 'reading' && readingTimerEndsAt) {
        logger.debug('[GameSessionObject] Dispatching START_ANSWERING');
        await this.manager.dispatchAction({ type: 'START_ANSWERING' });
      }
      else {
        logger.debug('[GameSessionObject] Dispatching TIMES_UP');
        await this.manager.dispatchAction({ type: 'TIMES_UP' });
      }
    }
  }
}

// And in the effect handler (SERVER ONLY)
if (action.type === 'START_TURN' && isServer) {
  const readingDuration = gameState.readingTime * 1000;
  const endsAt = Date.now() + readingDuration;

  // ❌ Uses ctx.ctx.storage.setAlarm() - different from local
  await ctx.ctx.storage.setAlarm(endsAt);

  return {
    type: 'START_READING_TIMER',
    payload: { endsAt },
  };
}
```

---

## Problems

### 1. **Inconsistent Timer Mechanisms**

| Aspect | Local Mode | Online Mode | Issue |
|---------|-------------|-------------|-------|
| Timer API | `setTimeout()` | `ctx.ctx.storage.setAlarm()` | Different APIs to manage |
| Cleanup | Manual `clearTimeout()` | Not needed (DO handles it) | Different lifecycle |
| Alarm Handler | Inline callback | Separate `alarm()` method | Code split across locations |

### 2. **Manual Phase Tracking**

The alarm handler must manually inspect state to determine which timer expired:

```typescript
// ❌ Brittle - relies on correct state shape
if (turnPhase === 'reading' && readingTimerEndsAt) {
  await this.manager.dispatchAction({ type: 'START_ANSWERING' });
}
else {
  await this.manager.dispatchAction({ type: 'TIMES_UP' });
}
```

**Issues:**
- Hardcoded phase strings (`'reading'`, `'answering'`)
- State shape coupling (`turnState?.phase`, `readingTimerEndsAt`)
- No type safety for phase transitions

### 3. **Code Duplication**

Timer logic duplicated between local and online modes:
- Both calculate durations
- Both return same timer actions
- Both handle edge cases (timer cleanup, error handling)

### 4. **Bug-Prone Architecture**

The recent bug (reading timer stuck in online mode) demonstrates the fragility:

```typescript
// ❌ Original buggy code - always dispatches TIMES_UP
async alarm() {
  await this.ensureInitialized();
  if (this.manager) {
    await this.manager.dispatchAction({ type: 'TIMES_UP' });
  }
}
```

This happened because:
- No explicit mapping between timers and actions
- Phase checking was added after the bug
- Manual synchronization is error-prone

### 5. **Not Reusable Across Games**

If another game needs sub-phases (e.g., "guessing" → "revealing" → "scoring"), they must:
- Duplicate all timer logic
- Handle local vs online differences
- Risk the same bugs

---

## Root Cause

**Missing Abstraction**: The `game-core` package provides high-level phase management (`lobby` → `playing` → `results`) but doesn't support:
- Sub-phases within the `playing` phase
- Unified timer management across local and online modes
- Automatic phase transitions based on timers

Each game implements this manually, leading to:
- Inconsistent patterns
- Duplication of effort
- Higher bug surface area

---

## Impact

### Developer Experience
- ❌ Must learn two different timer APIs
- ❌ Must manually sync local/online logic
- ❌ Hard to add new games with sub-phases

### Code Quality
- ❌ Duplication violates DRY principle
- ❌ Type safety compromised by manual phase checks
- ❌ Fragile state coupling

### Maintainability
- ❌ Changes require updating multiple files
- ❌ Easy to introduce bugs (like the reading timer issue)
- ❌ Tests must cover both local and online code paths

### Extensibility
- ❌ Adding new sub-phases requires boilerplate
- ❌ No unified pattern for future games
- ❌ Hard to implement advanced features (e.g., timer pausing)

---


## Benefits

### Developer Experience
- ✅ **Single API**: One pattern for both local and online modes
- ✅ **Declarative**: Define phases once, transitions handled automatically
- ✅ **Type-Safe**: Compile-time checking of valid phases

### Code Quality
- ✅ **DRY**: No duplication between local/online
- ✅ **Separation of Concerns**: Timer logic in game-core, game rules in game package
- ✅ **Reduced Bug Surface**: Framework handles edge cases

### Maintainability
- ✅ **Centralized**: Changes in one place
- ✅ **Testable**: Can test phase machine independently
- ✅ **Explicit**: Clear what phases exist and how they transition

### Extensibility
- ✅ **Reusable**: Any game can use sub-phase system
- ✅ **Flexible**: Supports dynamic durations, validation, custom actions
- ✅ **Future-Proof**: Easy to add features like timer pausing


---

## Related Documentation

- [System Context](./SYSTEM_CONTEXT.md) - Execution modes overview
- [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md) - Design rules
- [Quick Reference](./architecture/quick-reference.md) - Developer patterns
- [ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md) - Current refactoring work

---

**Last Updated:** Feb 10, 2026
