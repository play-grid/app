import process from 'node:process';
import { createFootballPlayersTransformer, createFootballTeamsTransformer, runSync } from '@playgrid/data-pipeline';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { statItemsTable } from '@/db/schema';

const apiKey = '2f4ba1d6baef66a36b5814b99e82b1ae';

console.log('🏈 Testing Football Data Pipeline with Database Sync\n');
console.log('====================================\n');

const dbPath = '../../apps/api/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b03431d2e16fe7a9ac99e19096d2a983b1db62385375ffc7f8dc90e4503488fb.sqlite';

let db;

try {
  console.log('🔗 Connecting to local database...');
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite);
  console.log('✅ Connected to database\n');
}
catch (error) {
  console.error('❌ Failed to connect to database:', error);
  console.log('Note: Make sure the dev server is running: cd apps/api && pnpm dev');
  process.exit(1);
}

console.log('====================================\n');

console.log('🔄 Syncing Football Players to Database...\n');
try {
  const playersTransformer = createFootballPlayersTransformer({ apiKey });
  const result = await runSync(playersTransformer, db, {
    table: statItemsTable,
  });
  console.log('✅ Players sync complete:');
  console.log(`   Inserted: ${result.inserted}`);
  console.log(`   Updated:  ${result.updated}`);
  console.log(`   Skipped:  ${result.skipped}`);
  console.log(`   Errors:   ${result.errors}`);
  console.log(`   Duration: ${result.duration}ms\n`);
}
catch (error) {
  console.error('❌ Players sync failed:', error);
}

console.log('====================================\n');

console.log('🔄 Syncing Football Teams to Database...\n');
try {
  const teamsTransformer = createFootballTeamsTransformer({ apiKey });
  const result = await runSync(teamsTransformer, db, {
    table: statItemsTable,
  });
  console.log('✅ Teams sync complete:');
  console.log(`   Inserted: ${result.inserted}`);
  console.log(`   Updated:  ${result.updated}`);
  console.log(`   Skipped:  ${result.skipped}`);
  console.log(`   Errors:   ${result.errors}`);
  console.log(`   Duration: ${result.duration}ms\n`);
}
catch (error) {
  console.error('❌ Teams sync failed:', error);
}

console.log('====================================\n');

console.log('📊 Querying database for synced data...\n');
try {
  const allItems = await db.select().from(statItemsTable).limit(5);
  console.log(`✅ Found ${allItems.length} stat items in database`);
  if (allItems.length > 0) {
    console.log('\nSample items:');
    console.log(JSON.stringify(allItems, null, 2));
  }
}
catch (error) {
  console.error('❌ Query failed:', error);
}

console.log('====================================\n');
console.log('✅ Full pipeline test complete!');

process.exit(0);
