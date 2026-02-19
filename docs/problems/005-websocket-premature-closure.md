# Problem: WebSocket Connections Closed Prematurely Due to Component Remount

**Status:** Resolved
**Date:** Feb 18, 2026
**Resolution:** Removed unnecessary `useEffect` cleanup causing premature adapter destruction

---

## Problem Description

Multiplayer WebSocket connections were being closed immediately after opening, causing connection failures and "reconnection loops" where the same WebSocket would attempt to connect, get closed, and reconnect repeatedly.

Players experienced:
- WebSocket connections closing with code 1006 (abnormal closure)
- Inability to maintain stable multiplayer connections
- Repeated reconnection attempts without success
- The same `sec-websocket-key` appearing in multiple request logs (indicating multiple socket instances)

---

## Root Cause

The `useEffect` cleanup function in `FiveSecondsLayout` was destroying the adapter on every component unmount:

```typescript
// apps/frontend/src/games/five-seconds/five-seconds-layout.tsx

useEffect(() => {
  return () => {
    destroyAdapter(); // ← Called on every unmount!
  };
}, []);
```

**The Problem Flow:**

1. Component mounts → `useMemo` creates adapter → WebSocket opens
2. Component **remounts** (React re-render) → `useEffect` cleanup runs
3. `destroyAdapter()` called → WebSocket closed immediately
4. Component renders again → `useMemo` creates new adapter → WebSocket opens again
5. Repeat...

React components can remount multiple times during normal rendering cycles (e.g., during state updates, search param changes, etc.). The cleanup was running **every time** this happened, destroying the WebSocket connection that had just been established.

---

## Why This Wasn't Caught Before

- The adapter uses a singleton pattern via `getOrCreateAdapter()` with identifier-based reuse
- The `useEffect` cleanup seemed like it would only run when the page was navigated away from
- In reality, React calls cleanup on **every unmount**, including remounts during rendering
- The singleton pattern was working correctly, but the premature destruction was negating its benefits

---

## The Fix

**Removed the unnecessary `useEffect` cleanup entirely:**

```typescript
// Before:
useEffect(() => {
  return () => {
    destroyAdapter();
  };
}, []);

// After:
// No cleanup needed - adapter lifecycle is managed by getOrCreateAdapter()
```

**Why This Works:**

1. `getOrCreateAdapter()` already manages adapter lifecycle based on identifiers
2. When switching from local → multiplayer mode (or vice versa), the identifier changes
3. The function detects the identifier change and automatically destroys the old adapter before creating the new one
4. When the identifier stays the same (remount during same session), the existing adapter is reused
5. No React cleanup needed - the singleton pattern handles all transitions correctly

---

## Verification

After the fix, the connection flow is stable:

1. Component mounts → `getOrCreateAdapter('multiplayer-ROOM_ID')` → WebSocket opens
2. Component remounts → `getOrCreateAdapter('multiplayer-ROOM_ID')` → **Returns existing adapter** → WebSocket stays open
3. Player refreshes page → Same flow, credentials retrieved from localStorage → WebSocket reconnects successfully
4. Player switches modes → `getOrCreateAdapter('local')` → Destroys old adapter, creates new one → Clean transition

---

## Related Documentation

- [ADR 004: Player Presence and Reconnection](./decisions/004-player-presence-and-reconnection.md) - **OBSOLETE** - This ADR addressed a different problem (ghost players, credential expiration) that was not the actual root cause
- [System Context](./SYSTEM_CONTEXT.md) - Durable Objects as authoritative session manager

---

**Last Updated:** Feb 18, 2026
