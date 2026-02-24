import { cuid2 } from 'drizzle-cuid2/sqlite';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp } from './utils';

export const countriesTable = sqliteTable('countries', {
  id: cuid2('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  flagUrl: text('flag_url').notNull(),
  countryCode: text('country_code').notNull().unique(),
  externalId: text('external_id'),
  region: text('region'),
  ...timestamp,
});
