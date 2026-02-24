import { cuid2 } from 'drizzle-cuid2/sqlite';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp } from './utils';

export const teamsTable = sqliteTable('teams', {
  id: cuid2('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url').notNull(),
  externalId: text('external_id').unique(),
  ...timestamp,
});
