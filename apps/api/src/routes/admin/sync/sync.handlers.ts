import type { SyncCountriesRoute, SyncFootballPlayersRoute, SyncFootballTeamsRoute } from './sync.routes';
import type { AppRouteHandler } from '@/lib/types';
import { createCountriesTransformer, createFootballPlayersTransformer, createFootballTeamsTransformer, runSync } from '@guess-logo/data-pipeline';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { getDB } from '@/db';
import { statItemsTable } from '@/db/schema';

export const syncFootballPlayersHandler: AppRouteHandler<SyncFootballPlayersRoute> = async (c) => {
  const db = getDB(c);
  const transformer = createFootballPlayersTransformer({
    apiKey: c.env.ALL_SPORTS_API_KEY,
  });

  try {
    const result = await runSync(transformer, db, {
      table: statItemsTable,
    });

    return c.json(result, HttpStatusCodes.OK);
  }
  catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const syncFootballTeamsHandler: AppRouteHandler<SyncFootballTeamsRoute> = async (c) => {
  const db = getDB(c);
  const transformer = createFootballTeamsTransformer({
    apiKey: c.env.ALL_SPORTS_API_KEY,
  });

  try {
    const result = await runSync(transformer, db, {
      table: statItemsTable,
    });

    return c.json(result, HttpStatusCodes.OK);
  }
  catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const syncCountriesHandler: AppRouteHandler<SyncCountriesRoute> = async (c) => {
  const db = getDB(c);
  const transformer = createCountriesTransformer();

  try {
    const result = await runSync(transformer, db, {
      table: statItemsTable,
    });

    return c.json(result, HttpStatusCodes.OK);
  }
  catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
