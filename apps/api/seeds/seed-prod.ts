import process from 'node:process';
import { drizzle } from 'drizzle-orm/d1';
import { getPlatformProxy } from 'wrangler';
import { logger } from '@/utils/logger';
import { seedD1Questions } from './shared/seed-questions';

async function main() {
  logger.warn('Seeding production database...');
  try {
    const { env } = await getPlatformProxy();
    const db = drizzle(env.GAME_HUB_DB as any);
    await seedD1Questions(db as any);
    logger.warn('Seeding completed successfully.');
  }
  catch (error) {
    logger.error(error, 'Error seeding production database:');
    process.exit(1);
  }
}

main();
