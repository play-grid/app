import type { SyncCompaniesRoute, SyncCountriesRoute, SyncFootballPlayersRoute, SyncFootballTeamsRoute } from './sync.routes';
import type { AppRouteHandler } from '@/lib/types';
import { APICountriesClient, createCompaniesTransformer, createCountriesTransformer, createFootballPlayersTransformer, createFootballTeamsTransformer, runSync } from '@playgrid/data-pipeline';
import { eq } from 'drizzle-orm';

import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';
import { companiesTable, countriesTable, statItemsTable } from '@/db/schema';
import { TranslationService } from '@/lib/services/translation-service';

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
  const { listId = 'top-gdp' } = c.req.valid('json') || {};
  const translationService = new TranslationService(c.env.AI);
  const apiClient = new APICountriesClient();

  const transformer = createCountriesTransformer({
    listId,
    fetchCountries: async () => {
      if (listId === 'top-population') {
        const allCountries = await apiClient.getAllCountries();
        return allCountries.sort((a, b) => (b.population || 0) - (a.population || 0));
      }

      const countries = await db.select().from(countriesTable);
      return countries.map((country) => {
        const hasTranslation = country.nameAr != null;

        return {
          name: {
            common: country.name,
            official: country.name,
          },
          tld: [],
          cca2: country.countryCode,
          cca3: '',
          independent: true,
          unMember: true,
          currencies: {},
          callingCodes: [],
          altSpellings: [],
          languages: {},
          translations: hasTranslation ? { ara: { common: country.nameAr!, official: country.nameAr! } } : undefined,
          latlng: [0, 0],
          demonym: '',
          landlocked: false,
          borders: [],
          area: 0,
          flagUrl: country.flagUrl,
          flag: { png: country.flagUrl, svg: '' },
          flags: { png: country.flagUrl, svg: '' },
          coatOfArms: { png: undefined, svg: undefined },
          capitalInfo: {},
          postalCode: {},
          timezones: [],
          continents: [],
        };
      });
    },
    translationService,
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
