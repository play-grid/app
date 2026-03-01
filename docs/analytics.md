# Analytics Documentation

## Overview

PostHog analytics is integrated throughout the PlayGrid platform to track user behavior, game interactions, and engagement metrics. The system uses consistent event naming, type-safe tracking, and follows PostHog best practices.

## Analytics Hook

**Location:** `apps/frontend/src/hooks/use-analytics.ts`

The `useAnalytics` hook provides typed methods for tracking all game events. All methods use Zod's discriminated union for type safety and automatically add a timestamp to each event.

### Implementation

```typescript
const capture = useCallback((analyticsEvent: AnalyticsEvent) => {
  posthog.capture(analyticsEvent.event, {
    ...analyticsEvent.properties,
    timestamp: new Date().toISOString(),
  });
}, [posthog]);

// Usage:
trackGameStart({
  game_id: 'five-seconds',
  game_mode: 'local',
  player_count: 2,
});
```

### Benefits

- **Type Safety:** TypeScript ensures correct properties for each event
- **Runtime Validation:** Zod schemas validate events at capture time
- **Discriminated Union:** Compiler checks event names and property compatibility
- **Auto-Timestamp:** Every event includes ISO timestamp

### Available Tracking Methods

| Method | Purpose |
|---------|---------|
| `trackGameSelected` | User selects a game from home page |
| `trackGameStart` | Game actually begins playing |
| `trackGameComplete` | Game ends with winner/loser |
| `trackGameReset` | User manually resets game |
| `trackGameQuit` | User navigates away or quits game |
| `trackGameModeSelected` | User selects local or multiplayer mode |
| `trackTurnStart` | New turn begins (Five Seconds) |
| `trackTurnComplete` | Turn finishes/voting ends (Five Seconds) |
| `trackVoteSubmit` | Player submits validity vote (Five Seconds) |
| `trackGridSizeChange` | User changes grid size (Guess Logo) |
| `trackListChange` | User changes logo list (Guess Logo) |
| `trackTurnSwitch` | Players switch turns (Guess Logo) |

## Event Naming Convention

All events follow PostHog best practices:

- **snake_case** for event names and property names
- **Present tense** verbs (start, complete, submit vs started, completed, submitted)
- **Object + Action** pattern (game_start, turn_complete, vote_submit)

### Event Catalog

| Event Name | Category | Description |
|-------------|------------|-------------|
| `game_selected` | Game Selection | User clicks game card or play button |
| `game_start` | Game Lifecycle | Game loads and begins playing |
| `game_complete` | Game Lifecycle | Game ends with winner/loser |
| `game_reset` | Game Lifecycle | User manually resets game |
| `game_quit` | Game Lifecycle | User leaves game |
| `game_mode_selected` | Game Configuration | Local vs multiplayer mode selected |
| `turn_start` | Gameplay | Turn begins (Five Seconds) |
| `turn_complete` | Gameplay | Turn ends/voting finished (Five Seconds) |
| `vote_submit` | Gameplay | Player submits vote (Five Seconds) |
| `grid_size_change` | Game Configuration | User changes grid size (Guess Logo) |
| `list_change` | Game Configuration | User changes logo list (Guess Logo) |
| `turn_switch` | Gameplay | Players switch turns (Guess Logo) |

## Event Tracking Locations

### Home Page

**File:** `components/game-card.tsx`

**Events Tracked:**
- `game_selected` - When clicking game card
- `game_selected` - When clicking play button (with `action: 'play_button_clicked'`)

**Properties:**
- `game_id`, `game_version`, `min_players`, `max_players`, `language`

**Analytics Attributes:**
- `data-analytics="game-card-{gameId}"` on card
- `data-analytics="play-button-{gameId}"` on play button

### Five Seconds Game

**Lobby Page:** `games/five-seconds/pages/lobby-page.tsx`
- `game_mode_selected` - Mode selected before start
- `game_start` - Game begins

**Gameplay Page:** `games/five-seconds/pages/gameplay-page.tsx`
- `turn_start` - Turn begins
- `vote_submit` - Player votes
- `turn_complete` - Voting ends
- `game_complete` - Someone wins (points to win reached)
- `game_reset` - Manual reset

**Results Page:** `games/five-seconds/pages/results-page.tsx`
- `game_complete` - Results page loads

### Guess Logo Game

**Setup Page:** `games/guess-logo/pages/game-setup-page.tsx`
- `game_start` - New game starts
- `game_start` - Saved game resumed (with `resumed: true`)

**Gameplay Page:** `games/guess-logo/pages/game-play-page.tsx`
- `grid_size_change` - Grid size changes
- `list_change` - Logo list changes
- `turn_switch` - Players switch turns
- `game_complete` - Player finds opponent's logo
- `game_reset` - Manual reset

## Type Definitions

**File:** `apps/frontend/src/lib/analytics-types.ts`

All event properties are defined as Zod schemas for runtime validation and type safety.

### Schemas

| Schema | Purpose |
|--------|---------|
| `GamePropertiesSchema` | Game metadata (id, version, mode, player count, language) |
| `TurnPropertiesSchema` | Turn-specific data (turn number, round, player ID) |
| `VotePropertiesSchema` | Voting data (voter, current player, validity) |
| `GameCompletionPropertiesSchema` | Game end data (winner, final scores, duration) |
| `GameResetPropertiesSchema` | Game reset data (reason, phase) |
| `GridChangePropertiesSchema` | Grid size changes (from/to size) |
| `ListChangePropertiesSchema` | Logo list changes (from/to list) |

### Discriminated Union

`AnalyticsEventSchema` uses Zod's discriminated union to ensure type safety:

```typescript
export const AnalyticsEventSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('game_selected'),
    properties: GamePropertiesSchema,
  }),
  z.object({
    event: z.literal('game_start'),
    properties: GamePropertiesSchema,
  }),
  // ... all 12 events
]);
```

This ensures:
- Each event name is validated at runtime
- Properties match the expected schema
- TypeScript infers correct types for each event
- Compile-time errors for invalid events or properties

## PostHog Configuration

**Provider Location:** `apps/frontend/src/app-providers.tsx`

```typescript
<PostHogProvider
  apiKey={env.VITE_PUBLIC_POSTHOG_KEY}
  options={{
    api_host: env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: '2025-05-24',
    capture_exceptions: true,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    debug: import.meta.env.MODE === 'development'
  }}
>
```

### Environment Variables

- `VITE_PUBLIC_POSTHOG_KEY` - PostHog project API key
- `VITE_PUBLIC_POSTHOG_HOST` - PostHog API endpoint

## Cross-Platform Compatibility

The analytics system is designed to work across web and future React Native implementations.

### Shared Components

**Event Names** - Identical across platforms
- All 12 events use same naming convention

**Event Properties** - Same TypeScript interfaces
- All property types are platform-agnostic
- Defined once, used everywhere

**Event Logic** - 90% shared
- Tracking methods work identically
- Only SDK initialization differs

### React Native Implementation

When building React Native app, the same analytics system can be used with minimal changes:

```typescript
// Install: pnpm add posthog-react-native

// Import same types
import type { GameProperties } from '@playgrid/lib/analytics-types';

// Use same event names
trackGameStart({
  game_id: 'five-seconds',
  game_mode: 'local',
  player_count: 2,
});

// Provider setup differs (in App.tsx):
// import { PostHogProvider } from 'posthog-react-native';
// <PostHogProvider apiKey={...} options={{...}}>
//   <App />
// </PostHogProvider>
```

## Data Insights

### Game Acquisition
- Game selection funnel: Page view → Game selected → Game start
- Most popular games (breakdown by `game_id`)
- Selection rate (game_start / game_selected)

### Game Engagement
- Average session duration (from `startedAt` to `game_complete`)
- Completion rate (game_complete / game_start)
- Reset rate (game_reset / game_start)
- Configuration preferences (grid sizes, lists, categories)

### Five Seconds Metrics
- Turn completion rate (turn_complete / turn_start)
- Voting patterns (vote_submit with `is_valid`)
- Average game duration (from `round_number` and timestamps)
- Points to win effectiveness

### Guess Logo Metrics
- Grid size preferences (breakdown by `grid_size_change`)
- List selection patterns (breakdown by `list_change`)
- Turn switching frequency (turn_switch events)
- Completion by grid size (correlate size and wins)

## Dashboard Setup

### Recommended Dashboards

1. **Game Acquisition Dashboard**
   - Game selection funnel
   - Most popular games
   - Selection rate by game

2. **Game Engagement Dashboard**
   - Session duration trends
   - Completion rate
   - Reset rate
   - Drop-off points

3. **Five Seconds Dashboard**
   - Turn completion rate
   - Voting accuracy
   - Game duration distribution
   - Player performance

4. **Guess Logo Dashboard**
   - Grid size distribution
   - List popularity
   - Turn switching patterns
   - Win rate by configuration

## Implementation Notes

### Race Condition Prevention

Uses `useRef` to prevent duplicate event tracking:
- Five Seconds: `hasProcessedVotingRef` prevents double turn completion
- Guess Logo: `hasTrackedWinnerRef` prevents double game completion

### Phase Tracking

Uses existing game state phase from `BaseGameStateSchema`:
- Accesses `phase` field: `'lobby' | 'playing' | 'results'`
- Used for tracking `current_phase` in reset events

### Stable Selectors

Added `data-analytics` attributes to interactive elements:
- Game cards: `data-analytics="game-card-{id}"`
- Play buttons: `data-analytics="play-button-{id}"`
- Enables reliable tracking without position-based selectors

---

**PostHog Version:** 1.321.2 (web)
**Events Tracked:** 12 unique events
**Implementation:** TypeScript + React
