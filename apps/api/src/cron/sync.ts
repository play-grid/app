import type { AppEnv } from '@/lib/types';
import { createFootballPlayersTransformer, createFootballTeamsTransformer, runSync } from '@playgrid/data-pipeline';
import { Hono } from 'hono';
import { getDB } from '@/db';
import { statItemsTable } from '@/db/schema';

export const syncCron = new Hono<AppEnv>();

syncCron.get('/sync-football', async (c) => {
  const db = getDB(c);
  const startTime = Date.now();

  try {
    const playersTransformer = createFootballPlayersTransformer({
      apiKey: c.env.ALL_SPORTS_API_KEY,
    });

    const teamsTransformer = createFootballTeamsTransformer({
      apiKey: c.env.ALL_SPORTS_API_KEY,
    });

    const [playersResult, teamsResult] = await Promise.allSettled([
      runSync(playersTransformer, db, { table: statItemsTable }),
      runSync(teamsTransformer, db, { table: statItemsTable }),
    ]);

    const results = {
      players: playersResult.status === 'fulfilled' ? playersResult.value : { error: playersResult.reason },
      teams: teamsResult.status === 'fulfilled' ? teamsResult.value : { error: teamsResult.reason },
      duration: Date.now() - startTime,
    };

    return c.json(results);
  }
  catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Sync failed',
        duration: Date.now() - startTime,
      },
      500,
    );
  }
});
