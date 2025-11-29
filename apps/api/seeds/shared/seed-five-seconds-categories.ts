/* eslint-disable no-console */
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { fiveSecondsCategories } from '@/routes/games/five-seconds/five-seconds.tables';

interface CategoryData {
  id: string;
  nameEn: string;
  nameAr: string;
}

const categoriesToSeed: CategoryData[] = [
  { id: 'cat_general_v1', nameEn: 'General', nameAr: 'عامة' },
  { id: 'cat_tech_games_v1', nameEn: 'Tech & Games', nameAr: 'تقنية وألعاب' },
  { id: 'cat_cinema_v1', nameEn: 'Cinema', nameAr: 'سينما' },
];

export async function seedD1FiveSecondsCategories(
  db: BetterSQLite3Database<any> | LibSQLDatabase<any>,
) {
  console.log('Seeding Five Seconds categories...');

  for (const category of categoriesToSeed) {
    const existingCategory = await db
      .select()
      .from(fiveSecondsCategories)
      .where(eq(fiveSecondsCategories.id, category.id))
      .get();

    if (!existingCategory) {
      await db.insert(fiveSecondsCategories).values({
        id: category.id,
        nameEn: category.nameEn,
        nameAr: category.nameAr,
      });
    }
  }

  console.log('Five Seconds categories seeded successfully!');
}
