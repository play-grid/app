# ADR 006: Stat Items ETL Pipeline & Data Table

**Status**: Proposed  
**Date**: Feb 22, 2026  
**Related ADRs**: 001-explicit-dataprovider.md, 002-break-circular-dependencies.md, 003-data-provider-abstraction.md

---

## Context

### What We're Building

The Higher/Lower game ("Stat Clash") requires hundreds of stat items — numerical facts players compare — across categories like football players, tech companies, countries, and movies. Each item represents **one metric for one entity**:

- Mbappé → career goals (value: 250, unit: "career goals")
- Mbappé → career assists (value: 120, unit: "career assists")  
- Apple → market cap (value: 3900, unit: "billion $ market cap")
- Apple → employees (value: 164000, unit: "employees")

Multiple metrics per entity means one player or company generates multiple stat items. This is intentional — it gives the game more variety and lets players compare the same entities on different dimensions.

### The Problem

Stat items cannot be hand-entered at scale. We need 80–150 entities per category, each with 2–4 metrics. That's 400–600 stat items minimum at launch, growing over time. We need a pipeline that:

1. Pulls raw entity data from external sources
2. Expands each entity into multiple stat items (one per metric)
3. Lands all items in DB as `pending`
4. Lets admin review and approve before any item reaches players
5. Re-syncs on a schedule to keep values fresh

### Where ETL Lives

ETL is **not** an API concern. It is shared data infrastructure — the same player photos and team logos used by Higher/Lower will be used by Guess Logo, and potentially future games. ETL lives in a dedicated package:

```
packages/data-pipeline/    ← ETL logic, transformers, sync runner
packages/data-provider/    ← CRUD, status handlers, admin route wiring
apps/api/                  ← Cron trigger, admin sync endpoint, game endpoint
```

`apps/api` only holds the trigger and the HTTP endpoints. All ETL logic is in `packages/data-pipeline`.

### Table Naming Philosophy

Tables are named after the **entity**, not the consumer game. A players table is `players`, not `higher_lower_players`. This allows future games to reuse the same data:

```
stat_items     → numerical comparison facts (all games that need Higher/Lower mechanics)
players        → player entities with images (reusable by Guess Logo, trivia games)
teams          → team entities with logos (reusable across games)
media_assets   → logos, flags, photos (reusable by any game)
```

---

## Decision

### 1. Single Normalized Table: `stat_items`

One table for all categories, all entity types, all metrics. Category and metric type are columns, not separate tables.

```typescript
export const statItemsTable = sqliteTable('stat_items', {
  id:           text('id').primaryKey().$defaultFn(() => nanoid()),

  // Entity
  entityType:   text('entity_type').notNull(),   // 'player' | 'team' | 'company' | 'country'
  externalId:   text('external_id'),             // Source system ID (API-Sports player ID, ticker, etc.)
  category:     text('category').notNull(),      // 'football' | 'companies' | 'countries' | 'movies'
  name:         text('name').notNull(),           // "Kylian Mbappé", "Apple Inc.", "India"

  // Metric (one row per metric per entity)
  metricType:   text('metric_type').notNull(),   // 'goals' | 'assists' | 'market-cap' | 'population'
  value:        real('value').notNull(),          // Always a number: 250, 3900, 1477000000
  unit:         text('unit').notNull(),           // "career goals", "billion $ market cap", "million people"

  // Images — reuse existing assets aggressively
  imageKey:     text('image_key'),               // Reference to logos/flags in media_assets
  imageUrl:     text('image_url'),               // Direct URL fallback (e.g. API-Sports player photo)

  // Display
  hint:         text('hint'),                    // Subtitle: team name, league, country

  // ETL & Admin
  source:       text('source').notNull(),        // 'api-sports' | 'alpha-vantage' | 'manual'
  status:       text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  isManualOverride: integer('is_manual_override', { mode: 'boolean' }).default(false),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  deletedAt:    integer('deleted_at', { mode: 'timestamp' }),
  createdAt:    integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

**Indexes needed:**
```typescript
// Fast game queries
index('idx_stat_items_game').on(statItemsTable.category, statItemsTable.status, statItemsTable.metricType),
// Fast ETL upsert lookups
index('idx_stat_items_external').on(statItemsTable.externalId, statItemsTable.category, statItemsTable.metricType),
```

**Why `metricType` is a column, not a separate table:**  
The CRUD, status, and admin layers from `packages/data-provider` work against one flat table. Normalizing metrics into a child table adds joins everywhere — in the game query, admin filter, and ETL upsert — for no practical benefit given the shape is identical across all metrics.

**Why `entityType`:**  
The game UI needs to render players differently from teams (badge icon, different fallback image logic). Storing `entityType` makes that a cheap column read rather than a category inference.

---

### 2. Transformer Interface

Every data source implements this interface. The transformer owns all source-specific logic. The sync runner is completely generic.

```typescript
// packages/data-pipeline/src/types.ts

export interface StatItemInput {
  entityType: string;
  externalId?: string;
  category: string;
  name: string;
  metricType: string;
  value: number;
  unit: string;
  imageKey?: string;
  imageUrl?: string;
  hint?: string;
  source: string;
}

export interface StatItemTransformer<TRaw> {
  source: string;
  category: string;
  fetch: () => Promise<TRaw[]>;
  transform: (raw: TRaw) => StatItemInput[];  // Returns ARRAY — one entity → multiple metrics
}
```

**`transform` returns an array, not a single item.** This is the key difference from ADR 004. One raw player object produces 3 stat items (goals, assists, appearances). The sync runner calls `transform()` and flattens the results.

---

### 3. Football Transformer (First Implementation)

```typescript
// packages/data-pipeline/src/transformers/football-players.ts

export const footballPlayersTransformer: StatItemTransformer<APISportsPlayerRaw> = {
  source: 'api-sports',
  category: 'football',

  fetch: async () => {
    const client = new APISportsClient(env.API_SPORTS_KEY);
    // Top scorers per league — 5 leagues × 20 players = 100 players
    // API-Sports /players endpoint returns stats inside the player object
    // One call per league page, ~10-15 calls total
    const leagues = [39, 140, 78, 135, 61]; // PL, La Liga, Bundesliga, Serie A, Ligue 1
    return client.getTopPlayersByLeagues(leagues, { season: 2024, limit: 20 });
  },

  transform: (player): StatItemInput[] => {
    const base = {
      entityType: 'player',
      externalId: String(player.player.id),
      category: 'football',
      name: player.player.name,
      imageUrl: player.player.photo,   // API-Sports provides player photos directly
      hint: player.statistics[0]?.team?.name,
      source: 'api-sports',
    };

    const stats = player.statistics[0]; // Current season stats
    const items: StatItemInput[] = [];

    if (stats?.goals?.total != null) {
      items.push({ ...base, metricType: 'goals', value: stats.goals.total, unit: 'goals this season' });
    }
    if (stats?.goals?.assists != null) {
      items.push({ ...base, metricType: 'assists', value: stats.goals.assists, unit: 'assists this season' });
    }
    if (stats?.games?.appearences != null) {
      items.push({ ...base, metricType: 'appearances', value: stats.games.appearences, unit: 'appearances' });
    }

    return items;
  },
};
```

**Football teams transformer:**

```typescript
// packages/data-pipeline/src/transformers/football-teams.ts

export const footballTeamsTransformer: StatItemTransformer<APISportsStandingRaw> = {
  source: 'api-sports',
  category: 'football',

  fetch: async () => {
    const client = new APISportsClient(env.API_SPORTS_KEY);
    // Standings endpoint — 1 call per league = 5 calls total
    const leagues = [39, 140, 78, 135, 61];
    return client.getStandings(leagues, { season: 2024 });
  },

  transform: (standing): StatItemInput[] => {
    const base = {
      entityType: 'team',
      externalId: String(standing.team.id),
      category: 'football',
      name: standing.team.name,
      imageUrl: standing.team.logo,
      hint: standing.league.name,
      source: 'api-sports',
    };

    return [
      {
        ...base,
        metricType: 'position',
        value: standing.rank,
        unit: 'league position',
      },
      {
        ...base,
        metricType: 'wins',
        value: standing.all.win,
        unit: 'wins this season',
      },
    ];
  },
};
```

---

### 4. Sync Runner

Generic — works for any transformer. Lives in `packages/data-pipeline`.

```typescript
// packages/data-pipeline/src/sync/run-sync.ts

export async function runSync<TRaw>(
  transformer: StatItemTransformer<TRaw>,
  db: DB,
): Promise<{ inserted: number; updated: number; skipped: number; errors: number }> {
  const rawItems = await transformer.fetch();

  let inserted = 0, updated = 0, skipped = 0, errors = 0;

  for (const raw of rawItems) {
    let inputs: StatItemInput[];

    try {
      inputs = transformer.transform(raw);
    } catch (err) {
      errors++;
      console.error(`Transform failed for item in ${transformer.category}:`, err);
      continue;
    }

    for (const input of inputs) {
      try {
        await upsertStatItem(input, db);
        // count inserted/updated/skipped based on result
      } catch (err) {
        errors++;
        console.error(`Upsert failed for ${input.name} (${input.metricType}):`, err);
      }
    }
  }

  return { inserted, updated, skipped, errors };
}

async function upsertStatItem(input: StatItemInput, db: DB) {
  if (!input.externalId) {
    await db.insert(statItemsTable).values({ ...input, status: 'pending' });
    return 'inserted';
  }

  const existing = await db.select()
    .from(statItemsTable)
    .where(and(
      eq(statItemsTable.externalId, input.externalId),
      eq(statItemsTable.category, input.category),
      eq(statItemsTable.metricType, input.metricType),  // ← metricType is part of the unique key
    ))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(statItemsTable).values({ ...input, status: 'pending' });
    return 'inserted';
  }

  if (existing[0].isManualOverride) {
    return 'skipped';
  }

  // Update value + sync metadata, preserve status (approved items stay approved)
  await db.update(statItemsTable)
    .set({
      value: input.value,           // Update the number
      unit: input.unit,             // Update unit label if changed
      imageUrl: input.imageUrl,     // Update image if changed
      hint: input.hint,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(statItemsTable.id, existing[0].id));

  return 'updated';
}
```

**Critical: `metricType` is part of the upsert lookup key.** Without it, Mbappé's goals row and assists row have the same `externalId` + `category` — you'd overwrite one with the other on every sync.

---

### 5. Approval Workflow

Uses `createStatusHandlers` from `packages/data-provider`.

```
pending  → approved   (looks good)
pending  → rejected   (bad data)
approved → rejected   (error found post-approval)
rejected → pending    (want to re-review)
```

```typescript
export const statItemStatusHandlers = createStatusHandlers({
  table: statItemsTable,
  statusField: 'status',
  transitions: {
    approve:  { from: ['pending'],            to: 'approved' },
    reject:   { from: ['pending','approved'], to: 'rejected' },
    restore:  { from: ['rejected'],           to: 'pending'  },
  },
});
```

**Bulk approve is the primary admin workflow** — after a football sync drops 300 pending items, admin bulk-selects all `metricType=goals` items from trusted sources and approves in one action.

**Admin-created items** set `status: 'approved'` and `isManualOverride: true` immediately on creation. They made the decision.

---

### 6. Admin Routes Wiring

```typescript
// apps/api/src/routes/admin/stat-items.routes.ts

const statItemsHandlers = createCRUDHandlers(statItemsTable, statItemSelectSchema, {
  searchFields: ['name'],
  filterMap: {
    status:     (v) => eq(statItemsTable.status, v),
    category:   (v) => eq(statItemsTable.category, v),
    metricType: (v) => eq(statItemsTable.metricType, v),
    entityType: (v) => eq(statItemsTable.entityType, v),
    source:     (v) => eq(statItemsTable.source, v),
  },
  sortFields: {
    name:      statItemsTable.name,
    value:     statItemsTable.value,
    createdAt: statItemsTable.createdAt,
  },
  softDelete: true,
});

export const statItemsAdminRoutes = createAdminRoutes({
  handlers: statItemsHandlers,
  schemas: {
    create: statItemCreateSchema,
    update: statItemUpdateSchema,
    query:  statItemQuerySchema,
  },
  statusHandlers: statItemStatusHandlers,
});
```

---

### 7. Game Consumption Endpoint

```
GET /data/stat-items?category=football&metricType=goals&status=approved&limit=20
GET /data/stat-items?category=football&status=approved&limit=10   ← mixed, game picks random
```

The game effect handler calls this endpoint. It reads from DB only — no ETL logic, no external API calls in the game path.

---

### 8. Sync Schedule

| Category | Source | Frequency | API cost |
|---|---|---|---|
| Football players | API-Sports | Weekly during season | ~15 calls/sync |
| Football teams | API-Sports | Weekly during season | 5 calls/sync |
| Companies | TBD (not Alpha Vantage — 25 req/day burst problem) | Monthly | TBD |
| Countries | World Bank / Wikipedia | Monthly | Free |
| Static facts | Manual only | On-demand | 0 |

Cron in `apps/api/wrangler.toml`:
```toml
[triggers]
crons = ["0 2 * * 1"]   # Every Monday 2am UTC
```

Manual trigger:
```
POST /admin/sync/football-players  → { inserted, updated, skipped, errors, duration }
POST /admin/sync/football-teams
```

---

## Package Structure

```
packages/data-pipeline/
├── src/
│   ├── transformers/
│   │   ├── football-players.ts
│   │   ├── football-teams.ts
│   │   └── index.ts
│   ├── sync/
│   │   └── run-sync.ts
│   ├── sources/
│   │   └── api-sports/
│   │       ├── client.ts          ← ExternalAPIBase subclass
│   │       └── types.ts           ← Raw API response types
│   ├── types.ts                   ← StatItemTransformer, StatItemInput
│   └── index.ts
├── package.json
└── tsconfig.json

packages/data-provider/            ← CRUD, status, route wiring (already built)

apps/api/
├── src/
│   ├── db/schema.ts               ← stat_items table definition
│   ├── routes/
│   │   ├── admin/
│   │   │   └── stat-items.routes.ts
│   │   └── data/
│   │       └── stat-items.routes.ts  ← game consumption endpoint
│   └── cron/
│       └── sync.ts                ← calls runSync from data-pipeline
```

---

## Implementation Order

1. **`stat_items` table** + drizzle-zod schemas + indexes (1 hour)
2. **Admin routes** using `createAdminRoutes` — proves data-provider works end-to-end (2 hours)
3. **`packages/data-pipeline` setup** + `StatItemTransformer` types + `runSync` (1 hour)
4. **API-Sports client** using `ExternalAPIBase` (1 hour)
5. **Football players transformer** + manual sync endpoint (2 hours)
6. **Football teams transformer** (1 hour)
7. **Game consumption endpoint** `GET /data/stat-items` (1 hour)
8. **Cron trigger** in wrangler.toml (30 min)

**Total**: ~10 hours to fully operational football pipeline.

---

## Fit with PlayGrid Architecture

| PlayGrid Concept | ETL Role |
|---|---|
| Pure reducers | Untouched. ETL is infrastructure. |
| Effect handlers | Higher/Lower calls `GET /data/stat-items?status=approved` — same pattern as Five Seconds fetching questions. |
| Durable Objects | Not involved. DO manages game session state only. |
| `packages/data-provider` | `createCRUDHandlers` + `createStatusHandlers` + `createAdminRoutes` wire the admin panel against `stat_items`. |
| Shared assets | `imageUrl` / `imageKey` from player/team rows reusable by Guess Logo and future games. |

---

## Consequences

**Positive**
- `metricType` column makes the game significantly more interesting without schema complexity
- One table, one admin panel, all categories and metrics visible together
- `packages/data-pipeline` is reusable across any future game that needs entity data
- ETL errors are isolated per-item — one bad transformer result doesn't abort the whole sync
- Image URLs collected during ETL are immediately available to other games

**Negative**
- `metricType` must be part of every game query filter or you get mixed metrics in one comparison round — easy to forget
- 300 pending items after a sync requires active admin review; stale content if admin doesn't log in
- Alpha Vantage eliminated for companies — need a replacement API with better burst limits before building that transformer