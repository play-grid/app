import process from 'node:process';
import { drizzle } from 'drizzle-orm/d1';
import { getPlatformProxy } from 'wrangler';
import { seedD1Questions } from './shared/questions';

async function main() {
  console.log('Seeding production database...');
  try {
    const { env } = await getPlatformProxy();
    const db = drizzle(env.GAME_HUB_DB);
    await seedD1Questions(db as any);
    console.log('Seeding completed successfully.');
  }
  catch (error) {
    console.error('Error seeding production database:', error);
    process.exit(1);
  }
}

main();
