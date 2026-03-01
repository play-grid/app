# Constraint: game-core Must Be Game-Agnostic

**Status:** Enforced
**Date:** Feb 6, 2026
**Applies to:** `packages/game-core/`

## Summary

The `game-core` Library MUST remain **game-agnostic**. It provides foundational infrastructure, contracts, and reusable patterns that ANY game can use, but it MUST NOT contain any game-specific logic, rules, or implementations.

---

## What game-core CAN Contain

✅ **Generic Infrastructure:**
- Type definitions (`BaseAction`, `BaseGameState`, `GameMeta`, `GameDefinition`)
- Base schemas and contracts
- Game registry system

✅ **Adapters (Generic):**
- Local adapter (Zustand-based state management) ,Multiplayer adapter (WebSocket communication) for DX convenience

✅ **Core Game Mechanics (Platform-Level):**
- Player roster management
- Turn progression primitives
- Phase lifecycle management (lobby → playing → results)
- Session management
- Connection handling

✅ **Reusable Patterns:**
- Effect handler contracts
- Validator contracts
- State management utilities
- Reducer composition helpers

✅ **Utilities (Game-Independent):**
- Logging utilities
- Error handling
- Type guards
- Helper functions

---

## What game-core MUST NOT Contain

❌ **Game-Specific Rules:**
- Timer logic specific to "Five Seconds" game
- Scoring rules specific to "Guess Logo" game
- Question fetching logic specific to any game

❌ **Game-Specific State Schemas:**
- `FiveSecondsGameState`
- `GuessLogoGameState`
- Game-specific action types beyond `BaseAction`

❌ **Game-Specific Effects:**
- `createFetchQuestionsEffect` (belongs in five-seconds package)
- `createFetchLogosEffect` (belongs in guess-logo package)
- Any effect that depends on specific game rules

❌ **Game-Specific Validators:**
- Validators that check "Five Seconds" specific rules
- Validators that validate "Guess Logo" specific actions

❌ **Domain Logic for Specific Games:**
- Question categorization logic (belongs in games or API)
- Logo metadata handling (belongs in guess-logo game)
- Sport/team data structures (belongs in guess-logo game)

---

## Correct Architectural Pattern

### game-core (Platform Layer)
```typescript
// packages/game-core/src/game-registry.ts
export function registerGame<TState, TAction>(
  definition: GameDefinition<TState, TAction>
): void {
  // Generic registration logic only
  // NO game-specific logic
}

// packages/game-core/src/adapters/local-adapter.ts
export function createLocalAdapter<TState, TAction>(
  definition: GameDefinition<TState, TAction>
): LocalAdapter<TState, TAction> {
  // Generic adapter logic
  // Works for ANY game
}
```

### games/* (Game Implementation Layer)
```typescript
// packages/games/five-seconds/src/definition.ts
import { createGameDefinition, registerGame } from '@playgrid/game-core';

// ✅ CORRECT: Game-specific logic in game package
export const fiveSecondsGame = createGameDefinition({
  meta: { id: 'five-seconds', ... },
  stateSchema: FiveSecondsGameStateSchema,  // Game-specific
  actionSchema: FiveSecondsActionSchema,   // Game-specific
  reducer: fiveSecondsReducer,            // Game-specific
  validator: validateFiveSecondsAction,    // Game-specific
});

registerGame(fiveSecondsGame);

// packages/games/five-seconds/src/logic/effects.ts
// ✅ CORRECT: Game-specific effects in game package
export function createFetchQuestionsEffect(
  httpClient: HttpClient,
  apiUrl: string
): GameEffect {
  // Game-specific effect logic
}
```

---

## Decision Guidelines

### When Logic Belongs in game-core

Add to game-core if:
- The logic is applicable to ALL games (e.g., player management)
- The logic is about HOW the platform works, not WHAT the game does
- The logic is reusable across different game types
- The logic doesn't reference specific game concepts (questions, logos, sports)

Examples:
- Generic turn system
- Generic phase transitions
- WebSocket connection management
- State persistence primitives

### When Logic Belongs in games/*

Add to a game package if:
- The logic is specific to ONE game
- The logic implements game rules or mechanics
- The logic references game-specific concepts
- The logic wouldn't make sense in a different game context

Examples:
- Five Seconds timer countdown (specific to 5-second time limit)
- Question fetching (specific to Q&A games)
- Logo categorization (specific to Guess Logo)
- Sport data handling (specific to sports-themed game)

---

## Related Documentation

- [System Context](./SYSTEM_CONTEXT.md) - Overview of platform architecture
- [Quick Reference](./architecture/quick-reference.md) - Patterns for creating games
- [ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md) - Dependency constraints

---

## Consequences

### Positive
- **Separation of Concerns**: Platform infrastructure separate from game logic
- **Reusability**: game-core can be used for any game
- **Maintainability**: Changes to one game don't affect platform infrastructure
- **Testability**: Platform logic tested independently of game logic
- **Extensibility**: New games can be added without modifying game-core

### Negative
- **Initial Design Effort**: Requires careful abstraction to avoid game-specific logic
- **Indirection**: Some logic may need to be abstracted into contracts
- **Documentation**: Must clearly document what belongs in game-core vs games/*

---

**Last Updated:** Feb 6, 2026
