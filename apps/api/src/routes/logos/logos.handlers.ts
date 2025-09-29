import type { LogoItem, LogoSetKey, LogoSetKey as TLogoSet } from '@guess-logo/shared/types';
import type { AppRouteHandler } from '../../lib/types';
import type {
  GetLogoListsRoute,
  GetLogosBySetAndListRoute,
} from './logos.routes';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { fetchLogoLists } from './services/logo-lists-service';
// Handler to get available lists for a logo set
export const getLogoLists: AppRouteHandler<GetLogoListsRoute> = async (c) => {
  const set = c.req.valid('param').set as LogoSetKey;

  try {
    const logoLists = await fetchLogoLists(set);

    // Return only the id and name for each list
    const simplifiedLists = logoLists.map(list => ({
      id: list.id,
      name: list.name,
    }));

    return c.json(simplifiedLists, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch logo lists for set ${set}:`, error);
    return c.json(
      { error: 'Failed to fetch logo lists' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

// Handler to get logos by set and list
export const getLogosBySetAndList: AppRouteHandler<GetLogosBySetAndListRoute> = async (
  c,
) => {
  const { set, list } = c.req.valid('param');
  const { count, language } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const cacheKey = `logos:${set}:${list}:${countNum}:${language}`;

  try {
    // Check cache first
    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached), HttpStatusCodes.OK);
    }

    // Fetch logos from the specific list
    const logos = await fetchLogosFromList(set, list, countNum, language);

    // Cache for 24 hours
    await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(logos), {
      expirationTtl: 86400,
    });

    return c.json(logos, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch logos for set ${set}, list ${list}:`, error);
    return c.json(
      { error: 'Failed to fetch logos' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

// Helper function to fetch logos from a specific list
async function fetchLogosFromList(
  set: TLogoSet,
  listId: string,
  count: number,
  language = 'en',
): Promise<LogoItem[]> {
  try {
    // Get all available lists for this set
    const logoLists = await fetchLogoLists(set);

    // Find the specific list
    const targetList = logoLists.find(list => list.id === listId);
    if (!targetList) {
      throw new Error(`List '${listId}' not found for set '${set}'`);
    }

    // Get logo items from the list with language parameter
    const logoItems = await targetList.fetchItems(language as any);

    // Take only the requested count
    const selectedItems = logoItems.slice(0, count);

    return selectedItems;
  }
  catch (error) {
    console.error(`Error fetching logos from list ${listId} in set ${set}:`, error);
    throw error;
  }
}
