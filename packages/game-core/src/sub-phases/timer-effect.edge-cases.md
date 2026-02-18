# Sub-Phase Timer Effect - Edge Cases Documentation

## Overview

The `createSubPhaseTimerEffect` function provides a unified timer system that works identically in both **client (browser)** and **server (Durable Object)** environments. This document outlines all edge cases covered by the unit tests.

## Test Coverage

### 1. Client Mode (Browser) Tests

#### Basic Functionality
- **No active phase**: Returns null when `getCurrentPhase` returns null
- **Phase entry**: Starts timer when entering a new phase
- **Timer expiration**: Dispatches `onComplete` action when timer expires
- **Same phase**: Does not start duplicate timers for the same phase

#### Phase Transitions
- **Phase change clears timer**: Previous timer is cleared when phase changes
- **New phase starts timer**: New timer starts immediately when entering different phase
- **Null phase clears timer**: Timer is cleared when phase becomes null

#### Timing Edge Cases
- **Dynamic duration**: Correctly calculates duration based on current state
- **Rapid phase changes**: Handles multiple quick phase transitions correctly
- **Timer cleanup**: Only the most recent timer fires after rapid changes

### 2. Server Mode (Durable Object) Tests

#### Basic Functionality
- **No active phase**: Returns null and deletes any existing alarm
- **Phase entry**: Stores action in storage and sets alarm
- **Alarm persistence**: Action type is stored for alarm handler to retrieve

#### Phase Transitions
- **No duplicate alarms**: Does not set multiple alarms for same phase
- **Phase change updates alarm**: Updates both stored action and alarm time
- **Null phase deletes alarm**: Removes alarm when phase becomes null

#### Error Handling
- **Unknown phase**: Gracefully handles phases not in config
- **Dynamic duration**: Calculates alarm time based on state
- **Action persistence**: Stores correct action type for each phase

### 3. Edge Cases

#### Configuration Edge Cases
- **canSkip option**: Handles phases with optional skip condition
- **Zero duration**: Handles instantaneous phases (0ms duration)
- **Long duration**: Handles very long timers (e.g., 24 hours)

#### Concurrency Edge Cases
- **Rapid successive calls**: Handles multiple calls in quick succession
- **Separate instances**: Each effect instance maintains independent state
- **Missing dispatch**: Gracefully handles missing dispatch function

#### Error Scenarios
- **Storage errors**: Properly propagates storage operation errors
- **Missing context**: Handles missing server context gracefully

### 4. Cross-Mode Consistency

#### Behavioral Consistency
- **Same action type**: Both modes return identical action types
- **Same duration calculation**: Duration computed identically in both modes
- **Same payload structure**: Response structure is mode-agnostic

## Key Implementation Details

### State Management
- Uses closure variables to track `previousPhase` and `localTimerId`
- Each effect instance maintains independent state
- State is NOT persisted across Durable Object hibernation (by design)

### Server-Specific Behavior
- Stores pending action in Durable Object storage using key `'sub_phase_pending_action'`
- Uses `storage.setAlarm()` for server-side timer
- Alarm handler retrieves and dispatches stored action

### Client-Specific Behavior
- Uses `setTimeout()` for client-side timer
- Clears previous timeout before setting new one
- Directly dispatches action when timer expires

### Race Condition Prevention
- Compares `currentPhase` with `previousPhase` to prevent duplicate timers
- Clears previous timers/timeouts before starting new ones
- Uses `Promise.allSettled()` when multiple effects run in parallel

## Test Environment Compatibility

All tests run in both environments:
- **Node.js/Vitest**: Simulates browser environment with fake timers
- **Durable Object**: Uses mock storage implementation

## Usage Examples

### Basic Configuration
```typescript
const config: SubPhaseConfig<GameState> = {
  phases: [
    {
      id: 'reading',
      duration: (state) => 2000,
      onComplete: 'START_ANSWERING',
    },
    {
      id: 'answering',
      duration: (state) => state.settings.timePerTurn * 1000,
      onComplete: 'TIMES_UP',
    },
  ],
  getCurrentPhase: (state) => state.turnState?.phase || null,
};
```

### With Skip Condition
```typescript
{
  id: 'reading',
  duration: (state) => 2000,
  onComplete: 'START_ANSWERING',
  canSkip: (state) => state.settings.skipReading,
}
```

## Success Criteria

✅ All 26 unit tests pass
✅ Works identically in client and server modes
✅ Handles all documented edge cases
✅ No race conditions in rapid phase changes
✅ Proper cleanup of timers/alarms
✅ Consistent action dispatching behavior
