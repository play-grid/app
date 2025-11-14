/* eslint-disable no-console */
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import fs from 'node:fs';
import path from 'node:path';
import { and, eq } from 'drizzle-orm';
import * as schema from '@/db/schema';

function getBaseDir() {
  const __filename = new URL(import.meta.url).pathname;
  const __dirname = path.dirname(__filename);

  return path.resolve(__dirname, '../data');
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-{2,}/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export async function seedD1Sports(db: BetterSQLite3Database<any> | LibSQLDatabase<any>) {
  const baseDir = getBaseDir();
  const regionsDir = path.join(baseDir, 'leagues-by-regions');
  const customDir = path.join(baseDir, 'custom-lists');

  if (fs.existsSync(regionsDir)) {
    const regionFiles = fs
      .readdirSync(regionsDir)
      .filter(f => f.startsWith('region-') && f.endsWith('.json'));

    for (const file of regionFiles) {
      const filePath = path.join(regionsDir, file);
      const regionCode = file.replace('region-', '').replace('.json', '');
      const regionData: any[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (!regionData.length)
        continue;

      const regionNameEn = regionData[0].regionNameEn ?? regionCode;
      const regionNameAr = regionData[0].regionNameAr ?? regionCode;

      const existingRegion = await db
        .select({ id: schema.sportRegions.id })
        .from(schema.sportRegions)
        .where(eq(schema.sportRegions.name_en, regionNameEn))
        .limit(1)
        .then(r => r[0]);

      let regionId: string;

      if (existingRegion) {
        regionId = existingRegion.id;
      }
      else {
        const result = await db
          .insert(schema.sportRegions)
          .values({
            name_en: regionNameEn,
            name_ar: regionNameAr,
          })
          .returning({ id: schema.sportRegions.id });

        if (result.length === 0) {
          console.error(`Failed to insert region: ${regionNameEn}. Insert operation returned no data.`);
          continue;
        }
        regionId = result[0].id;
      }

      for (const league of regionData) {
        const existingLeague = await db
          .select({ id: schema.leagues.id })
          .from(schema.leagues)
          .where(
            and(
              eq(schema.leagues.name, league.name),
              eq(schema.leagues.regionId, regionId),
            ),
          )
          .limit(1)
          .then(r => r[0]);

        let leagueId: string;

        if (existingLeague) {
          leagueId = existingLeague.id;
        }
        else {
          const result = await db
            .insert(schema.leagues)
            .values({
              name: league.name,
              country: league.country,
              regionId,
            })
            .returning({ id: schema.leagues.id });

          if (result.length === 0) {
            console.error(`Failed to insert league: ${league.name}. Insert operation returned no data.`);
            continue;
          }
          leagueId = result[0].id;
        }

        if (Array.isArray(league.teams) && league.teams.length > 0) {
          for (const team of league.teams) {
            const exists = await db
              .select({ id: schema.teams.id })
              .from(schema.teams)
              .where(
                and(
                  eq(schema.teams.name, team.name),
                  eq(schema.teams.leagueId, leagueId),
                ),
              )
              .limit(1)
              .then(r => r[0]);

            if (!exists) {
              await db
                .insert(schema.teams)
                .values({
                  name: team.name,
                  logo: team.logo ?? null,
                  leagueId,
                })
                .onConflictDoNothing();
            }
          }
        }
      }
    }
  }
  else {
    console.warn('Warning: Regions directory not found:', regionsDir);
  }

  if (fs.existsSync(customDir)) {
    const customFiles = fs.readdirSync(customDir).filter(f => f.endsWith('.json'));

    for (const file of customFiles) {
      const filePath = path.join(customDir, file);
      const listData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (!listData.name || !Array.isArray(listData.teams)) {
        console.warn(`Warning: Invalid custom list format in ${file}`);
        continue;
      }

      const slug = slugify(listData.name);
      const existingList = await db
        .select({ id: schema.customLists.id })
        .from(schema.customLists)
        .where(eq(schema.customLists.slug, slug))
        .limit(1)
        .then(r => r[0]);

      let listId: string;

      if (existingList) {
        listId = existingList.id;

        await db
          .delete(schema.customListItems)
          .where(eq(schema.customListItems.listId, listId));
      }
      else {
        const result = await db
          .insert(schema.customLists)
          .values({ name: listData.name, slug })
          .returning({ id: schema.customLists.id });

        if (result.length === 0) {
          console.error(`Failed to insert custom list: ${listData.name}. Insert operation returned no data.`);
          continue;
        }
        listId = result[0].id;
      }

      for (const team of listData.teams) {
        let teamRecord = await db
          .select({ id: schema.teams.id })
          .from(schema.teams)
          .where(eq(schema.teams.name, team.name))
          .limit(1)
          .then(r => r[0]);

        if (!teamRecord) {
          const leagueId = typeof team.leagueId === 'string' && team.leagueId.length > 0
            ? team.leagueId
            : null;

          const result = await db
            .insert(schema.teams)
            .values({
              name: team.name,
              logo: team.logo ?? null,
              leagueId,
            })
            .returning({ id: schema.teams.id });

          if (result.length === 0) {
            console.error(`Failed to insert team: ${team.name}. Insert operation returned no data.`);
            continue;
          }
          teamRecord = result[0];
        }

        await db
          .insert(schema.customListItems)
          .values({
            listId,
            teamId: teamRecord.id,
          })
          .onConflictDoNothing();
      }
    }
  }
  else {
    console.warn('Warning: Custom lists directory not found:', customDir);
  }

  console.log('Sports database seeded successfully!');
}
