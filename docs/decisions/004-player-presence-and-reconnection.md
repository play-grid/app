# ADR 003: Player Presence and Reconnection

**Status:** Proposed  
**Date:** Feb 18, 2026  
**Author:** TBD

---

## Context

The multiplayer session system has three bugs with real UX impact:

1. **Ghost players** — disconnected players stay in room state indefinitely, blocking room capacity
2. **Credentials expire silently** — after 5 minutes, reconnection fails and the app quietly falls back to local mode with no user notification
3. **No feedback loop** — players have no idea what's happening when reconnection fails

The system has three unsynchronized layers (connection maps, game state, credentials storage) and no mechanism to reconcile them on disconnect.

---

## Decision

Fix the three concrete problems with minimal surface area changes. Do not refactor the architecture.

### 1. Auto-remove ghost players after a grace period

When a WebSocket closes, start a 30-second timeout. If the player hasn't reconnected by then, dispatch `REMOVE_PLAYER`.

**Why 30 seconds?** Long enough to survive a page refresh or brief network blip. Short enough that rooms don't stay polluted for minutes.

```typescript
// game-session.object.ts — webSocketClose()

async webSocketClose(ws: WebSocket): Promise<void> {
  const playerId = this.playerIds.get(ws);
  this.playerIds.delete(ws);

  if (playerId && this.playerConnections.get(playerId) === ws) {
    this.playerConnections.delete(playerId);

    // Grace period before removing from game state
    this.ctx.waitUntil(
      this.schedulePlayerRemoval(playerId, 30_000)
    );
  }
}

private async schedulePlayerRemoval(playerId: string, delayMs: number): Promise<void> {
  await scheduler.wait(delayMs);

  // Only remove if they haven't reconnected
  if (!this.playerConnections.has(playerId)) {
    await this.manager?.dispatch({ type: 'REMOVE_PLAYER', payload: { playerId } });
  }
}
```

**No new abstractions.** Uses existing `REMOVE_PLAYER` action. No changes to game-core or reducers.

---

### 2. Extend credential lifetime + add a refresh endpoint

Change credential TTL from **5 minutes to 24 hours**. Add a single `/refresh-credentials` endpoint that resets the expiry if the credentials are still valid.

The frontend calls this endpoint on WebSocket reconnect before attempting the upgrade.

**Why 24 hours instead of a complex rotation scheme?** Credentials already live in Durable Object storage. A long TTL is simpler than building refresh token rotation. If someone's tab is open for >24h, they can re-join (room capacity is freed by the grace period mechanism above).

```typescript
// New endpoint: POST /api/game-room/:roomId/refresh-credentials
// Body: { playerId, credentials }
// Returns: { credentials, expiresAt } or 401

private async handleRefreshCredentials(request: Request): Promise<Response> {
  const { playerId, credentials } = await request.json();
  const stored = await this.ctx.storage.get<CredentialsData>(`credentials:${credentials}`);

  if (!stored || stored.playerId !== playerId || stored.expiresAt < Date.now()) {
    return new Response(JSON.stringify({ error: 'Invalid or expired credentials' }), { status: 401 });
  }

  // Extend expiry
  const updated = { ...stored, expiresAt: Date.now() + 24 * 60 * 60 * 1000 };
  await this.ctx.storage.put(`credentials:${credentials}`, updated);

  return new Response(JSON.stringify({ credentials, expiresAt: updated.expiresAt }), { status: 200 });
}
```

Also update the initial credential issue to use 24h:

```typescript
expiresAt: Date.now() + 24 * 60 * 60 * 1000, // was 5 * 60 * 1000
```

---

### 3. Show clear error states in the frontend

Remove the silent fallback to local mode. Show the user what happened and give them a path forward.

```typescript
// five-seconds-layout.tsx (and any other game layout)

const [connectionError, setConnectionError] = useState<'expired' | 'rejected' | null>(null);

// Before creating multiplayer adapter, attempt credential refresh
if (isMultiplayer) {
  try {
    await refreshCredentials(roomId, session.playerId, session.credentials);
    adapter = createMultiplayerAdapter({ ... });
  } catch (err) {
    if (err.status === 401) {
      setConnectionError('expired');
    } else {
      setConnectionError('rejected');
    }
    // Do NOT silently fall back to local mode
    return;
  }
}
```

```tsx
if (connectionError === 'expired') {
  return (
    <ErrorScreen
      title="Session expired"
      message="Your connection to this room expired. The room may still be active."
      action={{ label: 'Re-join room', onClick: () => navigate(`/room/${roomId}/join`) }}
    />
  );
}

if (connectionError === 'rejected') {
  return (
    <ErrorScreen
      title="Could not reconnect"
      message="You're no longer in this room, possibly because you were inactive too long."
      action={{ label: 'Back to lobby', onClick: () => navigate('/') }}
    />
  );
}
```

---

## What We're NOT Doing (and Why)

| Idea | Why skipped |
|---|---|
| Heartbeat-based presence | Adds complexity; grace period achieves the same goal for our use case |
| Credential rotation on every reconnect | Overkill; 24h TTL solves the real problem (refresh during active session) |
| Unified presence layer / refactor | The three-layer architecture works fine once synchronized on disconnect |
| Automatic credential cleanup | Expired creds are small. Add a scheduled cleanup later if storage becomes a concern |
| Optimistic reconnection UI | Nice to have, not blocking |

---

## Tradeoffs

**Grace period is a fixed 30s.** This is a judgment call. Too short and a slow page refresh kicks the player. Too long and ghost players linger. 30s feels right but should be tunable via an env var if needed.

**24h credentials are long-lived.** If someone leaks their credentials URL, an attacker could join their session. Acceptable risk given: (a) room codes are already semi-public, (b) the alternative (complex token rotation) is significantly more code to maintain.

**No architecture change.** The three-layer system stays. This is intentional — the bugs are behavioral, not structural. If a future feature (e.g., spectators, presence indicators) requires a unified presence model, that's a better time to refactor.