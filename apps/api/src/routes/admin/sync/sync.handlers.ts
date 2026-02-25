import type { SyncCompaniesRoute, SyncCountriesRoute, SyncFootballPlayersRoute, SyncFootballTeamsRoute } from './sync.routes';
import type { AppRouteHandler } from '@/lib/types';
import { createCompaniesTransformer, createCountriesTransformer, createFootballPlayersTransformer, createFootballTeamsTransformer, runSync } from '@guess-logo/data-pipeline';
import { eq } from 'drizzle-orm';

import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';
import { companiesTable, statItemsTable } from '@/db/schema';

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

export const syncCompaniesHandler: AppRouteHandler<SyncCompaniesRoute> = async (c) => {
  const db = getDB(c);
  const { listId } = c.req.valid('json');

  const transformer = createCompaniesTransformer({
    apiKey: c.env.LOGO_DEV_API_KEY,
    listId,
    fetchCompanies: async (id) => {
      const companies = await db
        .select()
        .from(companiesTable)
        .where(eq(companiesTable.listId, id));
      return companies.map(company => ({
        nameEn: company.nameEn,
        nameAr: company.nameAr,
        listId: company.listId,
      }));
    },
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
