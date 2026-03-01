# Solution: Unified Sub-Phase Timer System

**Status:** Proposed
**Date:** Feb 10, 2026
**Related Problem:** [003-inconsistent-sub-phase-management.md](./003-inconsistent-sub-phase-management.md)

---

## Problem Summary

The Five Seconds game has sub-phases (reading → answering → voting) that use different timer mechanisms in local vs online modes:
- **Local**: `setTimeout()` with inline callback
- **Online**: `ctx.ctx.storage.setAlarm()` with manual phase checking

This causes bugs, code duplication, and is not reusable across games.

---

## Proposed Solution

### Core Idea

Instead of complex state machines with lifecycle hooks, provide a **simple configuration-based timer system**:

1. Games define sub-phases declaratively
2. One effect handler manages timers for both modes
3. Store the action to dispatch, not the phase to check
4. Alarm handler just dispatches the stored action

**No manual phase checking = no bugs.**

---

## Implementation

### 1. Sub-Phase Types (Simple Configuration)

```typescript
// packages/game-core/src/sub-phases/types.ts

/**
 * Definition of a single sub-phase
 */
export interface SubPhaseDefinition<TState> {
  /** Unique identifier for this sub-phase */
  id: string;

  /** Calculate duration in milliseconds from current state */
  duration: (state: TState) => number;

  /** Action type to dispatch when timer expires */
  onComplete: string;

  /** Optional: Allow early exit if condition is met */
  canSkip?: (state: TState) => boolean;
}

/**
 * Complete sub-phase configuration for a game
 */
export interface SubPhaseConfig<TState> {
  /** All defined sub-phases */
  phases: SubPhaseDefinition<TState>[];

  /** Get current sub-phase from state */
  getCurrentPhase: (state: TState) => string | null;
}
```

### 2. Unified Timer Effect Handler

```typescript
// packages/game-core/src/sub-phases/timer-effect.ts

import type { GameEffect, GameEffectContext } from '../types';

const PENDING_ACTION_KEY = 'sub_phase_pending_action';

export function createSubPhaseTimerEffect<TState>(
  config: SubPhaseConfig<TState>,
): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;

  return async (ctx: GameEffectContext) => {
    const state = ctx.state as TState;
    const currentPhase = config.getCurrentPhase(state);

    // No current phase or no timer needed
    if (!currentPhase) return null;

    const phaseDef = config.phases.find(p => p.id === currentPhase);
    if (!phaseDef) return null;

    // Calculate duration
    const duration = phaseDef.duration(state);
    const endsAt = Date.now() + duration;
    const isServer = !!ctx.ctx?.storage;

    // ✅ UNIFIED: Same logic, different timer API
    if (isServer) {
      // Store the action to dispatch in alarm handler
      await ctx.ctx.storage.put(PENDING_ACTION_KEY, phaseDef.onComplete);
      // Set alarm
      await ctx.ctx.storage.setAlarm(endsAt);
    }
    else {
      // Clear any existing timer
      if (localTimerId) {
        clearTimeout(localTimerId);
      }

      // Set local timer
      localTimerId = setTimeout(async () => {
        await ctx.dispatch({ type: phaseDef.onComplete });
        localTimerId = undefined;
      }, duration);
    }

    return {
      type: 'SUB_PHASE_TIMER_STARTED',
      payload: { phase: currentPhase, endsAt },
    };
  };
}

/**
 * Helper to stop local timer when needed
 */
export function createSubPhaseCleanupEffect(): GameEffect {
  let localTimerId: ReturnType<typeof setTimeout> | undefined;

  return async (ctx: GameEffectContext) => {
    const isServer = !!ctx.ctx?.storage;

    // Only cleanup in local mode
    if (!isServer && localTimerId) {
      clearTimeout(localTimerId);
      localTimerId = undefined;
    }

    return null;
  };
}
```

### 3. Generic Alarm Handler (No Phase Checking!)

```typescript
// apps/api/src/durable-objects/game-session/game-session.object.ts

const PENDING_ACTION_KEY = 'sub_phase_pending_action';

export class GameSessionObject extends DurableObject<AppEnv['Bindings']> {
  // ... existing code ...

  async alarm() {
    logger.debug('[GameSessionObject] Alarm triggered');
    await this.ensureInitialized();

    if (this.manager) {
      // ✅ NO MANUAL PHASE CHECKING - just dispatch stored action
      const actionType = await this.ctx.storage.get<string>(PENDING_ACTION_KEY);

      if (actionType) {
        logger.debug(`[GameSessionObject] Dispatching stored action: ${actionType}`);
        await this.manager.dispatchAction({ type: actionType });

        // Clear the stored action
        await this.ctx.storage.delete(PENDING_ACTION_KEY);
      }
      else {
        logger.warn('[GameSessionObject] Alarm triggered but no pending action');
      }
    }
  }
}
```

### 4. Five Seconds Game Configuration

```typescript
// packages/games/five-seconds/src/logic/sub-phases.ts

import type { SubPhaseConfig } from '@playgrid/game-core';
import type { FiveSecondsGameState } from './schema';

export const fiveSecondsSubPhases: SubPhaseConfig<FiveSecondsGameState> = {
  phases: [
    {
      id: 'reading',
      // Dynamic duration based on question length
      duration: (state) => {
        if (!state.currentQuestion) return 2000;
        return Math.max(2000, Math.ceil(state.currentQuestion.text.length / 10) * 1000);
      },
      onComplete: 'START_ANSWERING',
    },
    {
      id: 'answering',
      // Duration from settings
      duration: (state) => state.settings.timePerTurn * 1000,
      onComplete: 'TIMES_UP',
    },
  ],
  getCurrentPhase: (state) => state.turnState?.phase || null,
};
```

### 5. Game Definition Integration

```typescript
// packages/games/five-seconds/src/definition.ts

import { createGameDefinition, registerGame } from '@playgrid/game-core';
import { createSubPhaseTimerEffect } from '@playgrid/game-core';
import { fiveSecondsSubPhases } from './logic/sub-phases';

export const fiveSecondsGame = createGameDefinition({
  meta: { id: 'five-seconds', /* ... */ },
  stateSchema: FiveSecondsGameStateSchema,
  actionSchema: FiveSecondsActionSchema,
  initialState: FIVE_SECONDS_INITIAL_STATE,
  reducer: fiveSecondsGameReducer,
  validator: validateFiveSecondsAction,
});

// Register with sub-phase timer effect
registerGame(fiveSecondsGame, (_client, _apiUrl) => [
  createSubPhaseTimerEffect(fiveSecondsSubPhases),
]);
```

---

## Comparison: Before vs After

### Before (Current - Bug-Prone)

```typescript
// ❌ Manual phase checking in alarm handler
async alarm() {
  await this.ensureInitialized();
  if (this.manager) {
    const state = this.manager.getState();
    const turnPhase = (state as any).turnState?.phase;

    // BUG PRONE: Must remember to check correct phase
    if (turnPhase === 'reading') {
      await this.manager.dispatchAction({ type: 'START_ANSWERING' });
    }
    else {
      await this.manager.dispatchAction({ type: 'TIMES_UP' });
    }
  }
}

// ❌ Duplicate timer logic in effect handler
if (action.type === 'START_TURN') {
  if (isServer) {
    await ctx.ctx.storage.setAlarm(endsAt);
  }
  else {
    setTimeout(() => dispatch('START_ANSWERING'), duration);
  }
}
```

### After (Proposed - Simple & Safe)

```typescript
// ✅ No phase checking - action stored by effect
async alarm() {
  await this.ensureInitialized();
  if (this.manager) {
    const actionType = await this.ctx.storage.get<string>(PENDING_ACTION_KEY);
    if (actionType) {
      await this.manager.dispatchAction({ type: actionType });
      await this.ctx.storage.delete(PENDING_ACTION_KEY);
    }
  }
}

// ✅ Single unified timer effect
// Works for both local and online modes
const effect = createSubPhaseTimerEffect({
  phases: [
    { id: 'reading', duration: (s) => s.readingTime * 1000, onComplete: 'START_ANSWERING' },
    { id: 'answering', duration: (s) => s.timePerTurn * 1000, onComplete: 'TIMES_UP' }
  ],
  getCurrentPhase: (s) => s.turnState?.phase
});
```

---

## Benefits

### 1. **Eliminates Bugs**

| Issue | Before | After |
|-------|--------|-------|
| Reading timer stuck | Manual phase checking missed | Action stored, auto-dispatched |
| Wrong action dispatched | Hardcoded phase strings | Action from configuration |
| Phase mismatch | State shape coupling | No phase check needed |

### 2. **Simpler Mental Model**

```typescript
// ✅ Just configuration - no classes, no lifecycle hooks
const config = {
  phases: [
    { id: 'reading', duration: (s) => s.readingTime * 1000, onComplete: 'START_ANSWERING' },
    { id: 'answering', duration: (s) => s.timePerTurn * 1000, onComplete: 'TIMES_UP' }
  ],
  getCurrentPhase: (s) => s.turnState?.phase
};
```

vs

```typescript
// ❌ Complex state machine with lifecycle
const config = {
  phases: {
    reading: {
      id: 'reading',
      onEnter: 'ENTER_READING',
      onExit: 'EXIT_READING',
      duration: ...,
      onTimeout: 'START_ANSWERING',
      canEnter: ...,
      canExit: ...
    }
  },
  initialPhase: 'reading',
  selectors: { currentPhase: ..., timerEndsAt: ... }
};
```

### 3. **DRY Principle**

- ✅ Timer logic written once
- ✅ Works for both modes
- ✅ Reusable across all games

### 4. **YAGNI Principle (You Aren't Gonna Need It)**

What we DON'T need:
- ❌ LocalSubPhaseManager class (simple timeout is fine)
- ❌ DurableSubPhaseManager class (unnecessary abstraction)
- ❌ onEnter/onExit hooks (games can dispatch manually if needed)
- ❌ canEnter/canExit validators (reducer already validates)
- ❌ Separate sync() and destroy() methods (not needed)

What we DO need:
- ✅ Simple configuration interface
- ✅ Unified timer effect
- ✅ Generic alarm handler
- ✅ Type safety

### 5. **Type-Safe Configuration**

```typescript
// ✅ TypeScript enforces correct structure
const config: SubPhaseConfig<MyGameState> = {
  phases: [
    {
      id: 'reading',
      duration: (s) => s.readingTime * 1000,
      onComplete: 'START_ANSWERING', // ❌ Type error if invalid action
    }
  ],
  getCurrentPhase: (s) => s.turnState?.phase,
};
```

### 6. **Extensible for New Games**

Any game can use this system:

```typescript
// Another game with different sub-phases
const myGameSubPhases: SubPhaseConfig<MyGameState> = {
  phases: [
    { id: 'guessing', duration: (s) => s.guessTime * 1000, onComplete: 'REVEAL_ANSWER' },
    { id: 'revealing', duration: (s) => s.revealTime * 1000, onComplete: 'SHOW_SCORE' },
  ],
  getCurrentPhase: (s) => s.roundPhase,
};
```

---

## Implementation Plan

### Phase 1: Core Types (30 minutes)
1. Create `packages/game-core/src/sub-phases/types.ts`
2. Define `SubPhaseDefinition` and `SubPhaseConfig`
3. Export from `packages/game-core/src/sub-phases/index.ts`

### Phase 2: Timer Effect (1 hour)
1. Create `packages/game-core/src/sub-phases/timer-effect.ts`
2. Implement `createSubPhaseTimerEffect()`
3. Implement `createSubPhaseCleanupEffect()` (optional)
4. Add to game-core exports

### Phase 3: Alarm Handler (30 minutes)
1. Update `GameSessionObject.alarm()`
2. Add `PENDING_ACTION_KEY` constant
3. Test alarm dispatches correct action

### Phase 4: Five Seconds Migration (1 hour)
1. Create `packages/games/five-seconds/src/logic/sub-phases.ts`
2. Define `fiveSecondsSubPhases` configuration
3. Remove manual timer logic from effect handlers
4. Update game registration to use new effect

### Phase 5: Testing (2 hours)
1. Unit tests for timer effect (both modes)
2. Integration tests with Five Seconds game
3. Manual testing in local and online modes
4. Test edge cases (question changes, settings updates)

### Phase 6: Documentation (30 minutes)
1. Update `quick-reference.md` with sub-phase example
2. Add to `CONTRAINTS/game-core-agnostic.md` (stays generic)
3. Create migration guide for existing games

**Total Estimated Time**: 5.5 hours

---

## Migration Path for Existing Code

### Before

```typescript
// Remove this manual timer code
if (action.type === 'START_TURN') {
  const readingDuration = gameState.readingTime * 1000;
  const endsAt = Date.now() + readingDuration;
  const isServer = !!ctx.ctx?.storage;

  if (isServer) {
    await ctx.ctx.storage.setAlarm(endsAt);
  }
  else {
    setTimeout(async () => {
      await dispatch({ type: 'START_ANSWERING' });
    }, readingDuration);
  }

  return {
    type: 'START_READING_TIMER',
    payload: { endsAt },
  };
}
```

### After

```typescript
// Add simple configuration
const fiveSecondsSubPhases: SubPhaseConfig<FiveSecondsGameState> = {
  phases: [
    {
      id: 'reading',
      duration: (state) => state.readingTime * 1000,
      onComplete: 'START_ANSWERING',
    },
  ],
  getCurrentPhase: (state) => state.turnState?.phase || null,
};

// Use in effect factory
export const createFiveSecondsEffects = () => [
  createSubPhaseTimerEffect(fiveSecondsSubPhases),
];
```

---

## Success Criteria

1. ✅ Five Seconds game uses new sub-phase system
2. ✅ Local and online modes behave identically
3. ✅ No manual timer code in game packages
4. ✅ Alarm handler has no phase checking
5. ✅ Type-safe configuration
6. ✅ Easy to add new games with sub-phases
7. ✅ All existing tests pass
8. ✅ Documentation updated

---

## Alternatives Rejected

### Alternative 1: State Machine with Lifecycle Hooks
- ❌ Rejected: Too complex for our needs
- ❌ Rejected: Violates YAGNI principle
- ❌ Rejected: Games don't need onEnter/onExit

### Alternative 2: Separate Manager Classes
- ❌ Rejected: Unnecessary abstraction
- ❌ Rejected: Adds complexity without benefit
- ❌ Rejected: Simple config is sufficient

### Alternative 3: Keep Manual Implementation
- ❌ Rejected: Bug-prone as demonstrated
- ❌ Rejected: Not reusable across games
- ❌ Rejected: Maintenance burden

---

## Related Documentation

- [003-inconsistent-sub-phase-management.md](./003-inconsistent-sub-phase-management.md) - Problem description
- [System Context](../SYSTEM_CONTEXT.md) - Execution modes overview
- [Quick Reference](../architecture/quick-reference.md) - Developer patterns

---

**Last Updated:** Feb 10, 2026
