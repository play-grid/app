# ADR 006: Stat Items ETL Pipeline & Data Table

**Status**: Implemented  
**Date**: Feb 22, 2026  
**Last Updated**: Feb 26, 2026  
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

### Internationalization Support

The system supports bilingual content (English/Arabic) with:
- `nameAr`, `unitAr`, `hintAr` fields for Arabic translations
- On-demand translation via AI service with caching in the database
- Language parameter in game consumption endpoint (`lang=en|ar`)

---

## Decision

### 1. Single Normalized Table: `stat_items`

One table for all categories, all entity types, all metrics. Category and metric type are columns, not separate tables.

```typescript
import { cuid2 } from 'drizzle-cuid2/sqlite';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const statItemsTable = sqliteTable('stat_items', {
  id: cuid2('id').defaultRandom().primaryKey(),

  // Entity
  entity:       text('entity_type').notNull(),      // 'player' | 'team' | 'company' | 'country'
  externalId:   text('external_id'),                // Source system ID (API-Sports player ID, ticker, etc.)
  category:     text('category').notNull(),         // 'football' | 'companies' | 'countries' | 'movies'
  name:         text('name').notNull(),             // "Kylian Mbappé", "Apple Inc.", "India"
  nameAr:       text('name_ar'),                    // Arabic name for bilingual support

  // Metric (one row per metric per entity)
  metricType:   text('metric_type').notNull(),      // 'goals' | 'assists' | 'market-cap' | 'population'
  value:        real('value').notNull(),            // Always a number: 250, 3900, 1477000000
  unit:         text('unit').notNull(),             // "career goals", "billion $ market cap", "million people"
  unitAr:       text('unit_ar'),                    // Arabic unit translation

  // Images — reuse existing assets aggressively
  imageKey:     text('image_key'),                  // Reference to logos/flags in media_assets
  imageUrl:     text('image_url'),                  // Direct URL fallback (e.g. API-Sports player photo)

  // Foreign keys for relationships
  teamId:       text('team_id').references(() => teamsTable.id),
  playerId:     text('player_id'),
  countryId:    text('country_id').references(() => countriesTable.id),

  // Display
  hint:         text('hint'),                       // Subtitle: team name, league, country
  hintAr:       text('hint_ar'),                    // Arabic hint translation

  // ETL & Admin
  source:       text('source').notNull(),          // 'api-sports' | 'restcountries' | 'logo-dev' | 'manual'
  status:       text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  isManualOverride: integer('is_manual_override', { mode: 'boolean' }).default(false),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  deletedAt:    integer('deleted_at', { mode: 'timestamp' }),
  createdAt:    integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt:    integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}, table => ({
  gameQueryIdx: index('idx_stat_items_game').on(table.category, table.status, table.metricType),
  externalLookupIdx: index('idx_stat_items_external').on(table.externalId, table.category, table.metricType),
}));
```

**Indexes needed:**
```typescript
// Fast game queries
gameQueryIdx: index('idx_stat_items_game').on(table.category, table.status, table.metricType),
// Fast ETL upsert lookups
externalLookupIdx: index('idx_stat_items_external').on(table.externalId, table.category, table.metricType),
```

**Key differences from proposal:**
- `entityType` renamed to `entity`
- Added `nameAr`, `unitAr`, `hintAr` for Arabic translations
- Added foreign keys (`teamId`, `playerId`, `countryId`) for relationships
- Uses `cuid2` instead of `nanoid` for IDs
- `updatedAt` uses `$onUpdateFn` for automatic updates

**Why `metricType` is a column, not a separate table:**  
The CRUD, status, and admin layers from `packages/data-provider` work against one flat table. Normalizing metrics into a child table adds joins everywhere — in the game query, admin filter, and ETL upsert — for no practical benefit given the shape is identical across all metrics.

**Why `entity`:**  
The game UI needs to render players differently from teams (badge icon, different fallback image logic). Storing `entity` makes that a cheap column read rather than a category inference.

---

### 2. Transformer Interface

Every data source implements this interface. The transformer owns all source-specific logic. The sync runner is completely generic.

```typescript
// packages/data-pipeline/src/types.ts

export interface StatItemTransformer<TRaw> {
  source: string;
  category: string;
  fetch: () => Promise<TRaw[]>;
  transform: (raw: TRaw) => StatItemInput[] | Promise<StatItemInput[]>;  // Can be async
}

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  duration: number;
}
```

```typescript
// packages/data-pipeline/src/schemas.ts

export const statItemInputSchema = z.object({
  entity: z.string().min(1),
  externalId: z.string().optional(),
  category: z.string().min(1),
  name: z.string().min(1),
  metricType: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  imageKey: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  hint: z.string().optional(),
  source: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export type StatItemInput = z.infer<typeof statItemInputSchema>;
```

**Key differences from proposal:**
- `transform` can now return `Promise<StatItemInput[]>` (async support)
- Added `SyncResult` interface that includes `duration`
- Schema validation uses zod

---

### 3. Football Transformer (First Implementation)

Uses factory pattern for configurability and testing.

```typescript
// packages/data-pipeline/src/transformers/football-players.ts

export interface FootballPlayersTransformerConfig {
  apiKey: string;
}

export function createFootballPlayersTransformer(config: FootballPlayersTransformerConfig): StatItemTransformer<APISportsPlayer> {
  const client = new APISportsClient({
    baseUrl: 'https://v3.football.api-sports.io',
    apiKey: config.apiKey,
  });

  return {
    source: 'api-sports',
    category: 'football',

    async fetch() {
      const leagues = [39, 140, 78, 135, 61]; // PL, La Liga, Bundesliga, Serie A, Ligue 1
      return client.getTopPlayersByLeagues(leagues, { season: 2024, limit: 20 });
    },

    transform(player) {
      const base = {
        entity: 'player',
        externalId: String(player.player?.id),
        category: 'football',
        name: player.player?.name ?? 'Unknown Player',
        imageUrl: player.player?.photo,
        hint: player.statistics[0]?.team?.name,
        source: 'api-sports',
      };

      const stats = player.statistics[0];
      const items: any[] = [];

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
}

export const footballPlayersTransformer = createFootballPlayersTransformer({ apiKey: '' });
```

**Football teams transformer:**

```typescript
// packages/data-pipeline/src/transformers/football-teams.ts

export interface FootballTeamsTransformerConfig {
  apiKey: string;
}

export function createFootballTeamsTransformer(config: FootballTeamsTransformerConfig): StatItemTransformer<APISportsStanding> {
  const client = new APISportsClient({
    baseUrl: 'https://v3.football.api-sports.io',
    apiKey: config.apiKey,
  });

  return {
    source: 'api-sports',
    category: 'football',

    async fetch() {
      const leagues = [39, 140, 78, 135, 61];
      return client.getStandings(leagues, { season: 2024 });
    },

    transform(standing) {
      const base = {
        entity: 'team',
        externalId: String(standing.team?.id),
        category: 'football',
        name: standing.team?.name ?? 'Unknown Team',
        imageUrl: standing.team?.logo,
        hint: standing.league?.name,
        source: 'api-sports',
      };

      return [
        { ...base, metricType: 'position', value: standing.rank ?? 0, unit: 'league position' },
        { ...base, metricType: 'wins', value: standing.all?.win ?? 0, unit: 'wins this season' },
      ];
    },
  };
}
```

---

### 4. Countries Transformer

Uses Rest Countries API with Arabic translation support.

```typescript
// packages/data-pipeline/src/transformers/countries.ts

export interface CountriesTransformerConfig {
  listId?: 'top-gdp' | 'top-population';
  fetchCountries: () => Promise<Country[]>;
  translationService: {
    translateText: (text: string, targetLang: 'ar' | 'en') => Promise<string>;
  };
}

export function createCountriesTransformer(config: CountriesTransformerConfig): StatItemTransformer<Country> {
  const client = new APICountriesClient();

  return {
    source: 'restcountries',
    category: 'countries',

    async fetch() {
      if (config.listId === 'top-population') {
        const allCountries = await client.getAllCountries();
        return allCountries.sort((a, b) => (b.population || 0) - (a.population || 0));
      }
      return await config.fetchCountries();
    },

    async transform(country) {
      const base = {
        entity: 'country',
        externalId: country.cca2,
        category: 'countries',
        name: country.name.common,
        imageUrl: country.flags?.png,
        source: 'restcountries',
      };

      // Translation logic with caching
      let nameAr = country.translations?.ara?.common;
      if (!nameAr) {
        nameAr = await config.translationService.translateText(country.name.common, 'ar');
      }

      const items: any[] = [];

      if (country.population) {
        items.push({
          ...base,
          nameAr,
          metricType: 'population',
          value: country.population,
          unit: 'people',
          unitAr: 'ناس',
          hint: country.region,
        });
      }

      if (country.area) {
        items.push({
          ...base,
          nameAr,
          metricType: 'area',
          value: country.area,
          unit: 'km²',
          unitAr: 'كيلومتر مربع',
        });
      }

      return items;
    },
  };
}
```

---

### 5. Companies Transformer

Uses Logo.dev API with list-based configuration.

```typescript
// packages/data-pipeline/src/transformers/companies.ts

export interface Company {
  nameEn: string;
  nameAr: string | null;
  listId: string;
}

export interface CompaniesTransformerConfig {
  apiKey: string;
  listId: string;
  fetchCompanies: (listId: string) => Promise<Company[]>;
}

export function createCompaniesTransformer(config: CompaniesTransformerConfig): StatItemTransformer<Company> {
  const client = new LogoDevClient({
    baseUrl: 'https://api.logo.dev',
    apiKey: config.apiKey,
  });

  return {
    source: 'logo-dev',
    category: config.listId,

    async fetch() {
      return await config.fetchCompanies(config.listId);
    },

    async transform(company) {
      const logoUrl = await client.getLogoUrl(company.nameEn);

      return [{
        entity: 'company',
        externalId: company.nameEn.toLowerCase().replace(/[^a-z0-9]/g, ''),
        category: config.listId,
        name: company.nameEn,
        nameAr: company.nameAr || null,
        metricType: 'brand',
        value: 1,
        unit: 'company',
        unitAr: 'شركة',
        imageUrl: logoUrl || null,
        hint: company.nameEn,
        hintAr: company.nameAr || null,
        source: 'logo-dev',
        status: 'approved', // Company items auto-approved
      }];
    },
  };
}
```

---

### 6. Sync Runner

Generic — works for any transformer with configurable options.

```typescript
// packages/data-pipeline/src/sync/run-sync.ts

export interface SyncOptions<TTable extends Table> {
  table: TTable;
  externalIdField?: keyof TTable['_']['columns'];
  categoryField?: keyof TTable['_']['columns'];
  metricTypeField?: keyof TTable['_']['columns'];
  manualOverrideField?: keyof TTable['_']['columns'];
}

export async function runSync<TRaw, TTable extends Table>(
  transformer: StatItemTransformer<TRaw>,
  db: DB,
  options: SyncOptions<TTable>,
): Promise<SyncResult> {
  const startTime = Date.now();

  let rawItems: TRaw[];
  try {
    rawItems = await transformer.fetch();
  }
  catch (err) {
    console.error(`Fetch failed for ${transformer.category}:`, err);
    return { inserted: 0, updated: 0, skipped: 0, errors: 1, duration: Date.now() - startTime };
  }

  let inserted = 0, updated = 0, skipped = 0, errors = 0;
  const table = options.table;

  if (!rawItems || (Array.isArray(rawItems) && rawItems.length === 0)) {
    return { inserted, updated, skipped, errors: 0, duration: Date.now() - startTime };
  }

  for (const raw of rawItems) {
    let inputs: StatItemInput[];

    try {
      inputs = await transformer.transform(raw);
    }
    catch (err) {
      errors++;
      console.error(`Transform failed for item in ${transformer.category}:`, err);
      continue;
    }

    for (const input of inputs) {
      const result = await upsertStatItem(input, db, table, options);
      if (result === 'inserted') inserted++;
      else if (result === 'updated') updated++;
      else if (result === 'skipped') skipped++;
      else errors++;
    }
  }

  return { inserted, updated, skipped, errors, duration: Date.now() - startTime };
}
```

```typescript
async function upsertStatItem<TTable extends Table>(
  input: StatItemInput,
  db: DB,
  table: TTable,
  options: SyncOptions<TTable>,
): Promise<UpsertResult> {
  // Field name mappings
  const externalIdField = (options.externalIdField || 'externalId') as string;
  const categoryField = (options.categoryField || 'category') as string;
  const metricTypeField = (options.metricTypeField || 'metricType') as string;
  const manualOverrideField = (options.manualOverrideField || 'isManualOverride') as string;

  const getTableColumn = (name: string): any => (table as Record<string, any>)[name];

  if (!input.externalId) {
    await db.insert(table).values(input as any);
    return 'inserted';
  }

  const existing = await db.select()
    .from(table)
    .where(and(
      eq(getTableColumn(externalIdField), input.externalId),
      eq(getTableColumn(categoryField), input.category),
      eq(getTableColumn(metricTypeField), input.metricType),
    ))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(table).values(input as any);
    return 'inserted';
  }

  if (existing[0]?.[manualOverrideField]) {
    return 'skipped';
  }

  const existingRecord = existing[0];
  const shouldUpdate
    = existingRecord.value !== input.value
      || existingRecord.imageUrl !== input.imageUrl
      || existingRecord.hint !== input.hint
      || existingRecord.unit !== input.unit;

  if (!shouldUpdate) {
    await db.update(table)
      .set({ lastSyncedAt: new Date() })
      .where(eq(getTableColumn('id'), existingRecord.id));
    return 'skipped';
  }

  await db.update(table)
    .set({
      entity: input.entity,
      value: input.value,
      unit: input.unit,
      imageUrl: input.imageUrl,
      hint: input.hint,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(getTableColumn('id'), existing[0].id));

  return 'updated';
}
```

**Key improvements from proposal:**
- Takes `SyncOptions` for configurability
- Returns duration in `SyncResult`
- Skips database update if values haven't changed (optimization)
- Field name mappings for flexibility

---

### 7. Approval Workflow

Manual implementation using direct database operations (not using `createStatusHandlers` from data-provider as proposed).

Status transitions:
```
pending  → approved   (looks good)
pending  → rejected   (bad data)
approved → rejected   (error found post-approval)
rejected → pending    (want to re-review)
```

**Bulk approve is the primary admin workflow** — after a football sync drops 300 pending items, admin bulk-selects all `metricType=goals` items from trusted sources and approves in one action.

**Admin-created items** set `status: 'approved'` and `isManualOverride: true` immediately on creation.

---

### 8. Admin Routes Wiring

```typescript
// apps/api/src/routes/admin/stat-items/stat-items.routes.ts

export const listStatItems = createRoute({
  path: '/',
  method: 'get',
  operationId: 'listAdminStatItems',
  tags: ['Stat Items'],
  request: { query: listStatItemsQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(listStatItemsResponseSchema, 'List of stat items with pagination'),
  },
});

export const createStatItem = createRoute({ /* ... */ });
export const updateStatItem = createRoute({ /* ... */ });
export const deleteStatItem = createRoute({ /* ... */ });
export const updateStatItemStatus = createRoute({ /* ... */ });
export const bulkUpdateStatus = createRoute({
  path: '/bulk/status',
  method: 'patch',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            ids: z.array(z.string()).min(1),
            status: z.enum(['approved', 'rejected', 'pending']),
          }),
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ updated: z.number(), errors: z.array(z.string()).optional() }),
      'Status update result',
    ),
  },
});
```

---

### 9. Game Consumption Endpoint

```typescript
// apps/api/src/routes/data/stat-items/stat-items.routes.ts

export const getStatItems = createRoute({
  path: '/stat-items',
  method: 'get',
  operationId: 'getStatItems',
  tags: ['Data'],
  request: {
    query: z.object({
      category: z.string().optional(),
      metricType: z.string().optional(),
      status: z.enum(['pending', 'approved', 'rejected']).default('approved'),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      excludeIds: z.array(z.string()).optional(),
      lang: z.enum(['en', 'ar']).default('en'), // Language support
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ items: z.array(statItemResponseSchema) }),
      'List of stat items for game consumption',
    ),
  },
});
```

The handler:
- Filters by category, metricType, status
- Supports excluding IDs (for game rounds)
- Returns random items using `ORDER BY RANDOM()`
- Translates to Arabic on-demand and caches in database
- Sets cache-control headers appropriately

---

### 10. Sync Endpoints

```typescript
// apps/api/src/routes/admin/sync/sync.routes.ts

export const syncFootballPlayers = createRoute({
  path: '/sync/football-players',
  method: 'post',
  operationId: 'syncFootballPlayers',
  tags: ['Admin Sync'],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ inserted: z.number(), updated: z.number(), skipped: z.number(), errors: z.number(), duration: z.number() }),
      'Sync result',
    ),
  },
});

export const syncCountries = createRoute({
  path: '/sync/countries',
  method: 'post',
  operationId: 'syncCountries',
  tags: ['Admin Sync'],
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({ listId: z.enum(['top-gdp', 'top-population']).optional() }),
        },
      },
    },
  },
  responses: { /* ... */ },
});

export const syncCompanies = createRoute({
  path: '/sync/companies',
  method: 'post',
  operationId: 'syncCompanies',
  tags: ['Admin Sync'],
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({ listId: z.enum(['companies', 'saudi']).default('companies') }),
        },
      },
    },
  },
  responses: { /* ... */ },
});
```

**Usage:**
```
POST /admin/sync/football-players  → { inserted, updated, skipped, errors, duration }
POST /admin/sync/football-teams
POST /admin/sync/countries  → { listId: 'top-gdp' | 'top-population' }
POST /admin/sync/companies  → { listId: 'companies' | 'saudi' }
```

---

### 11. Cron Schedule

Implemented as Hono route handler in `apps/api/src/cron/sync.ts`:

```typescript
export const syncCron = new Hono<AppEnv>();

syncCron.get('/sync-football', async (c) => {
  const db = getDB(c);
  const startTime = Date.now();

  const playersTransformer = createFootballPlayersTransformer({ apiKey: c.env.ALL_SPORTS_API_KEY });
  const teamsTransformer = createFootballTeamsTransformer({ apiKey: c.env.ALL_SPORTS_API_KEY });

  const [playersResult, teamsResult] = await Promise.allSettled([
    runSync(playersTransformer, db, { table: statItemsTable }),
    runSync(teamsTransformer, db, { table: statItemsTable }),
  ]);

  return c.json({
    players: playersResult.status === 'fulfilled' ? playersResult.value : { error: playersResult.reason },
    teams: teamsResult.status === 'fulfilled' ? teamsResult.value : { error: teamsResult.reason },
    duration: Date.now() - startTime,
  });
});
```

**Sync schedule:**
| Category | Source | Frequency | API cost |
|---|---|---|---|
| Football players | API-Sports | Weekly during season | ~15 calls/sync |
| Football teams | API-Sports | Weekly during season | 5 calls/sync |
| Countries | Rest Countries API | Monthly | Free |
| Companies | Logo.dev | On-demand | Based on usage |

---

## Package Structure

```
packages/data-pipeline/
├── src/
│   ├── transformers/
│   │   ├── football-players.ts      ← Factory function createFootballPlayersTransformer()
│   │   ├── football-teams.ts        ← Factory function createFootballTeamsTransformer()
│   │   ├── countries.ts             ← Factory function createCountriesTransformer()
│   │   ├── companies.ts             ← Factory function createCompaniesTransformer()
│   │   └── index.ts
│   ├── sync/
│   │   └── run-sync.ts              ← Generic sync runner with SyncOptions
│   ├── sources/
│   │   ├── api-sports/
│   │   │   ├── client.ts            ← APISportsClient
│   │   │   └── types.ts             ← APISportsPlayer, APISportsStanding
│   │   ├── api-countries/
│   │   │   ├── index.ts             ← APICountriesClient
│   │   │   └── types.ts             ← Country
│   │   ├── logo-dev/
│   │   │   ├── client.ts            ← LogoDevClient
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── types.ts                     ← StatItemTransformer, StatItemInput, SyncResult
│   ├── schemas.ts                   ← Zod schemas for validation
│   ├── sync.test.ts                 ← Unit tests for sync runner
│   ├── transformers.test.ts         ← Unit tests for transformers
│   └── index.ts

packages/data-provider/            ← CRUD, status, route wiring (already built)

apps/api/
├── src/
│   ├── db/
│   │   └── stat-items.tables.ts     ← stat_items table definition
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── stat-items/
│   │   │   │   ├── stat-items.routes.ts
│   │   │   │   ├── stat-items.handlers.ts
│   │   │   │   ├── stat-items.schemas.ts
│   │   │   │   └── stat-items.index.ts
│   │   │   └── sync/
│   │   │       ├── sync.routes.ts  ← Sync endpoints for all transformers
│   │   │       ├── sync.handlers.ts
│   │   │       └── sync.index.ts
│   │   └── data/
│   │       └── stat-items/
│   │           ├── stat-items.routes.ts    ← Game consumption endpoint
│   │           ├── stat-items.handlers.ts   ← With Arabic translation support
│   │           └── stat-items.index.ts
│   ├── cron/
│   │   └── sync.ts                  ← Hono cron handler /sync-football
│   └── services/
│       └── stat-items.service.ts    ← Business logic for stat items
```

---

## Implementation Status

| Feature | Status | Notes |
|---|---|---|
| `stat_items` table | ✅ Implemented | With Arabic fields and foreign keys |
| Admin routes | ✅ Implemented | CRUD + status transitions + bulk operations |
| `packages/data-pipeline` | ✅ Implemented | With factory pattern transformers |
| API-Sports client | ✅ Implemented | External API client |
| Football players transformer | ✅ Implemented | Factory function with async transform |
| Football teams transformer | ✅ Implemented | Factory function with async transform |
| Countries transformer | ✅ Implemented | Rest Countries API + translation |
| Companies transformer | ✅ Implemented | Logo.dev API + list-based config |
| Game consumption endpoint | ✅ Implemented | With language support |
| Cron trigger | ✅ Implemented | Hono-based cron handler |
| Sync runner | ✅ Implemented | Generic with SyncOptions |
| Unit tests | ✅ Implemented | sync.test.ts, transformers.test.ts |

---

## Key Differences From Proposal

| Area | Proposal | Implementation |
|---|---|---|
| Table field `entityType` | Proposed | Implemented as `entity` |
| ID generation | `nanoid()` | Implemented `cuid2` |
| Transformer pattern | Single transformer instance | Factory functions for configurability |
| Transform return type | `StatItemInput[]` | `StatItemInput[] \| Promise<StatItemInput[]>` (async) |
| Data sources | API-Sports, Alpha Vantage | API-Sports, Rest Countries, Logo.dev |
| Arabic support | Not proposed | Added `nameAr`, `unitAr`, `hintAr` fields |
| Foreign keys | Not proposed | Added `teamId`, `playerId`, `countryId` |
| Sync runner | Basic options | `SyncOptions` with field name mappings |
| Sync result | Basic stats | Includes `duration` |
| Cron implementation | wrangler.toml | Hono route handler |
| Testing | Integration tests | Unit tests (sync.test.ts, transformers.test.ts) |

---

## Fit with PlayGrid Architecture

| PlayGrid Concept | ETL Role |
|---|---|
| Pure reducers | Untouched. ETL is infrastructure. |
| Effect handlers | Higher/Lower calls `GET /data/stat-items?status=approved` — same pattern as Five Seconds fetching questions. |
| Durable Objects | Not involved. DO manages game session state only. |
| `packages/data-provider` | Manual CRUD handlers + admin routes (not using `createStatusHandlers` as proposed). |
| Shared assets | `imageUrl` / `imageKey` from player/team rows reusable by Guess Logo and future games. |
| Bilingual support | On-demand Arabic translation via AI service with database caching. |

---

## Consequences

**Positive**
- `metricType` column makes the game significantly more interesting without schema complexity
- One table, one admin panel, all categories and metrics visible together
- `packages/data-pipeline` is reusable across any future game that needs entity data
- ETL errors are isolated per-item — one bad transformer result doesn't abort the whole sync
- Image URLs collected during ETL are immediately available to other games
- Factory pattern for transformers makes testing and configurability easier
- Bilingual support with on-demand translation and caching
- Sync runner optimizations skip unnecessary database updates

**Negative**
- `metricType` must be part of every game query filter or you get mixed metrics in one comparison round — easy to forget
- 300 pending items after a sync requires active admin review; stale content if admin doesn't log in
- Arabic translation requires AI service which adds latency and cost on first request
- Companies transformer uses list-based config which requires pre-populated company data

---

## Testing Strategy

### Implemented Tests

**Unit Tests for Sync Runner** (`sync.test.ts`):
- Insert new items when no externalId exists
- Update existing items when externalId matches
- Skip items marked as manual override
- Handle transform errors gracefully
- Return duration
- Handle multiple items from single raw data

**Unit Tests for Transformers** (`transformers.test.ts`):
- Transform player data correctly
- Handle missing statistics gracefully
- Handle null values in statistics
- Correct transformer metadata

### Test Philosophy

Tests verify **what the system does** (sync data from API to database), not **how** it does it (specific method calls). This approach:
- Catches integration issues between components
- Allows implementation changes without breaking tests
- Verifies actual database state (the source of truth)
- Focuses on user-facing behavior

### Testing Patterns Used

1. **Mock database operations** - Use `vi.fn()` to simulate database calls without real database
2. **Verify database operations** - After sync, verify correct database methods were called
3. **Test failure scenarios** - What happens when transforms fail, when database operations fail, etc.
4. **Test edge cases** - Null values, empty arrays, missing fields

---

## Date History

- **Feb 22, 2026**: Initial proposal
- **Feb 26, 2026**: Updated to reflect actual implementation status
