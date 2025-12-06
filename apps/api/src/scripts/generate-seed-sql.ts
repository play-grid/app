import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { logger } from '@/utils/logger';

async function generateSeedSql() {
  logger.info('Generating seed SQL...');
  const dataPath = path.resolve(
    process.cwd(),
    'src/routes/games/five-seconds/questions/data/questions.json',
  );
  const questionsData = await fs.readFile(dataPath, 'utf-8');
  const questions = JSON.parse(questionsData);

  let sql = '';
  for (const q of questions) {
    const question = q.question.replace(/'/g, '\'\'');
    const exampleAnswers = q.exampleAnswers ? q.exampleAnswers.replace(/'/g, '\'\'') : '';
    const categoryId = q.categoryId;
    const difficulty = q.difficulty;
    const metadata = q.metadata ? JSON.stringify(q.metadata).replace(/'/g, '\'\'') : null;

    const id = crypto.randomUUID();
    sql += `INSERT OR IGNORE INTO five_seconds_questions (id, question, example_answers, category_id, difficulty, metadata, createdAt, updatedAt) VALUES ('${id}', '${question}', '${exampleAnswers}', '${categoryId}', '${difficulty}', '${metadata}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n`;
  }

  const outputPath = path.resolve(process.cwd(), 'seeds/seed-prod.sql');
  await fs.writeFile(outputPath, sql);
  logger.info('Seed SQL generated successfully.');
}

generateSeedSql();
