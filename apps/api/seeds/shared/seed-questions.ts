import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { eq } from 'drizzle-orm';
import { fiveSecondsQuestions } from '@/db/schema';
import { logger } from '@/utils/logger';

const BATCH_SIZE = 100;

function getBaseDir() {
  const __filename = new URL(import.meta.url).pathname;
  const __dirname = path.dirname(__filename);

  return path.resolve(__dirname, '../data');
}

export async function seedD1Questions(db: BetterSQLite3Database<any> | LibSQLDatabase<any>) {
  logger.info('Seeding questions...');
  const baseDir = getBaseDir();
  const dataPath = path.join(baseDir, 'questions.json');

  const questionsData = await fs.readFile(dataPath, 'utf-8');
  const questions = JSON.parse(questionsData);

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    const insertPromises = batch.map(async (q: any) => {
      const existing = await db
        .select()
        .from(fiveSecondsQuestions)
        .where(eq(fiveSecondsQuestions.question, q.question))
        .get();

      if (!existing) {
        return db.insert(fiveSecondsQuestions).values({
          id: crypto.randomUUID(),
          question: q.question,
          exampleAnswers: q.exampleAnswers,
          categoryId: q.categoryId,
          difficulty: q.difficulty,
          metadata: JSON.stringify(q.metadata),
        });
      }
    });
    await Promise.all(insertPromises);
    logger.info(`Batch ${i / BATCH_SIZE + 1} processed.`);
  }

  logger.info('Seeding complete!');
}
