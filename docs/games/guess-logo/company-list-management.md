# Managing Guess Logo Company Lists

How to add, remove, or rename companies in the guess-logo game.

## Source of Truth

The company list is defined in `apps/api/seeds/shared/seed-companies.ts` in the `companies` array.

- **`listId: 'companies'`** — global companies (119 entries)
- **`listId: 'saudi'`** — Saudi companies (81 entries)

## Full Re-seed Process

Run this when you add new companies or change names.

```sh
# 1. Stop wrangler
kill $(pgrep -f "wrangler.*dev") 2>/dev/null

# 2. Re-seed the local D1 database (runs all seeders, including seedD1Companies)
npx tsx apps/api/seeds/seed-local.ts

# 3. Clear KV cache
rm -rf apps/api/.wrangler/state/v3/kv

# 4. Start wrangler
cd apps/api && pnpm dev

# 5. Sync logos from LogoDev for the affected list(s)
curl -X POST http://localhost:8789/api/admin/sync/sync/companies \
  -H 'Content-Type: application/json' \
  -d '{"listId": "saudi"}'

curl -X POST http://localhost:8789/api/admin/sync/sync/companies \
  -H 'Content-Type: application/json' \
  -d '{"listId": "companies"}'

# 6. Verify the endpoint returns the expected count
curl "http://localhost:8789/api/games/guess-logo/logos/companies/saudi?count=100"
```

## Caveats

| Action | Behavior |
|--------|----------|
| **Add** | Seed inserts new rows (check by `nameEn`). Sync fetches logos. |
| **Rename** | Seed only **inserts** by `nameEn`. The old `nameEn` record stays orphaned in both `companiesTable` and `statItemsTable`. |
| **Remove** | Seed never deletes. Records remain in the DB forever. |
| **No LogoDev match** | Sync logs as `skipped`. The endpoint filters these out — they will not appear in game results. |

### To fully rename or remove a company

You must manually clean the DB. Connect to the SQLite file directly:

```sh
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite
```

```sql
-- Find old records
SELECT id, name_en, list_id FROM companies WHERE name_en LIKE '%old-name%';

-- Delete from companies table
DELETE FROM companies WHERE id = '<id>';

-- Delete synced logo data
DELETE FROM stat_items WHERE name = 'Old Name' AND category LIKE 'companies-%';
```

## Architecture

```
seeds/seed-companies.ts  ──►  companiesTable (D1)
                                    │
                    sync endpoint calls LogoDev API
                                    │
                                    ▼
                              statItemsTable (D1)
                                    │
                    fetchStatItems() queries by category
                                    │
                                    ▼
                      logos/companies/:listId endpoint
```

## Related Files

- `apps/api/seeds/shared/seed-companies.ts` — company list + seeder
- `apps/api/seeds/seed-local.ts` — runs all local seeders
- `apps/api/src/routes/admin/sync/sync.handlers.ts` — sync handler
- `apps/api/src/routes/games/guess-logo/logos/data/companies/fetchers-from-db.ts` — fetches logos from stat items
- `apps/api/src/services/stat-items.service.ts` — queries stat items with translation fallback
