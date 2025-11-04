import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { eq } from 'drizzle-orm';
import { fiveSecondsQuestions } from '@/db/schema';
import { db } from '@/db/script-db';

const BATCH_SIZE = 100;

async function seedD1Questions() {
  try {
    console.log('Seeding questions...');

    const dataPath = path.resolve(
      process.cwd(),
      'src/routes/games/five-seconds/questions/data/questions.json',
    );
    const questionsData = await fs.readFile(dataPath, 'utf-8');
    const questions = JSON.parse(questionsData);

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);
      const insertPromises = batch.map(async (q: any) => {
        const existing = await db.query.fiveSecondsQuestions.findFirst({
          where: eq(fiveSecondsQuestions.question, q.question),
        });

        if (!existing) {
          return db.insert(fiveSecondsQuestions).values({
            question: q.question,
            exampleAnswers: q.exampleAnswers,
            categoryId: q.categoryId,
            difficulty: q.difficulty,
            metadata: JSON.stringify(q.metadata),
          });
        }
      });
      await Promise.all(insertPromises);
      console.log(`Batch ${i / BATCH_SIZE + 1} processed.`);
    }

    console.log('Seeding complete!');
  }
  catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

seedD1Questions();
