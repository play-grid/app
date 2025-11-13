import { cuid2 } from 'drizzle-cuid2/sqlite';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp } from '@/db/utils';

export const sportRegions = sqliteTable('sport_regions', {
  id: cuid2('id').defaultRandom().primaryKey(),
  name_en: text('name_en').notNull(),
  name_ar: text('name_ar').notNull(),
  ...timestamp,
});

export const leagues = sqliteTable('leagues', {
  id: cuid2('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  regionId: text('region_id')
    .notNull()
    .references(() => sportRegions.id),
  ...timestamp,
});

export const teams = sqliteTable('teams', {
  id: cuid2('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logo: text('logo').notNull(),
  leagueId: text('league_id')
    .references(() => leagues.id),
  ...timestamp,
});

export const customLists = sqliteTable('custom_lists', {
  id: cuid2('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ...timestamp,
});

export const customListItems = sqliteTable('custom_list_items', {
  id: cuid2('id').defaultRandom().primaryKey(),
  listId: text('list_id')
    .notNull()
    .references(() => customLists.id),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id),
  ...timestamp,
});

export const sportRegionRelations = relations(sportRegions, ({ many }) => ({
  leagues: many(leagues),
}));

export const leagueRelations = relations(leagues, ({ many, one }) => ({
  region: one(sportRegions, {
    fields: [leagues.regionId],
    references: [sportRegions.id],
  }),
  teams: many(teams),
}));

export const teamRelations = relations(teams, ({ one }) => ({
  league: one(leagues, { fields: [teams.leagueId], references: [leagues.id] }),
}));

export const customListRelations = relations(customLists, ({ many }) => ({
  items: many(customListItems),
}));

export const customListItemRelations = relations(customListItems, ({ one }) => ({
  list: one(customLists, {
    fields: [customListItems.listId],
    references: [customLists.id],
  }),
  team: one(teams, { fields: [customListItems.teamId], references: [teams.id] }),
}));
