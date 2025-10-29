import env from '@/env';
import { seedKV } from '@/scripts/seed-kv';

async function seedQuestions() {
  await seedKV({
    kvNamespaceId: env.QUESTIONS_KV_ID || '07bd0d479a8444139fc0b3584f9c28ae',
    dataPath: 'src/routes/games/five-seconds/questions/data/questions.json',
    keyField: 'question',
  });
}
seedQuestions();
