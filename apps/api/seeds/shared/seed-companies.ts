import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { eq } from 'drizzle-orm';
import { companiesTable } from '@/db/schema';
import { logger } from '@/utils/logger';

interface CompanySeed {
  nameEn: string;
  nameAr: string | null;
  listId: 'companies' | 'saudi';
}

const companies: CompanySeed[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'companies.json'), 'utf-8'),
);

export async function seedD1Companies(
  db: BetterSQLite3Database<any> | LibSQLDatabase<any>,
) {
  logger.info({ count: companies.length }, 'Seeding companies...');

  let seeded = 0;

  for (const company of companies) {
    const existing = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.nameEn, company.nameEn))
      .get();

    if (!existing) {
      await db.insert(companiesTable).values({
        nameEn: company.nameEn,
        nameAr: company.nameAr,
        listId: company.listId,
      });
      seeded++;
    }
  }

  logger.info({ seeded, total: companies.length }, 'Companies seeded successfully!');
}
