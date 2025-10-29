import type {
  LogoItem,
  LogoOverrides,
  LogoSetKey,
  LogoSetKey as TLogoSet,
} from '@guess-logo/shared/types';
import type { GetLogoListsRoute, GetLogosBySetAndListRoute } from './logos.routes';
import type { AppRouteHandler } from '@/lib/types';
import { logoOverrides as rawOverrides } from '@guess-logo/shared/data';
import { shuffleArray } from '@guess-logo/shared/utils';
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
  const { count, language, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);
  const logoOverrides = rawOverrides as LogoOverrides;

  const overrideVersion = logoOverrides._v || '';

  // Cache key for the FULL dataset (without count or shuffle in the key)
  const fullDatasetCacheKey = `logos:full:${set}:${list}:${language}:${overrideVersion}`;

  try {
    let allLogos: LogoItem[];

    // Check cache for full dataset first
    const cached = await c.env.LOGO_CACHE.get(fullDatasetCacheKey);

    if (cached) {
      allLogos = JSON.parse(cached);
    }
    else {
      const logos = await fetchLogosFromList(set, list, language);

      allLogos = logos.map((logo) => {
        const overrideKey = logo.originalName || logo.name;
        const overrideUrl = logoOverrides.sets[set]?.[list]?.[overrideKey];

        if (overrideUrl) {
          return { ...logo, imageUrl: overrideUrl };
        }
        return logo;
      });

      await c.env.LOGO_CACHE.put(fullDatasetCacheKey, JSON.stringify(allLogos), {
        expirationTtl: 86400,
      });
    }

    let processedLogos: LogoItem[];

    // If shuffle is requested, shuffle the full dataset then slice
    if (shuffle === true) {
      const shuffledLogos = shuffleArray([...allLogos]); // Clone to avoid mutating cache
      processedLogos = shuffledLogos.slice(0, countNum);
    }
    else {
      // No shuffle, just take the first N items
      processedLogos = allLogos.slice(0, countNum);
    }

    return c.json(processedLogos, HttpStatusCodes.OK);
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
    // Pass listId so fetchItems can check for overrides
    const logoItems = await targetList.fetchItems(language as any, listId);

    return logoItems;
  }
  catch (error) {
    console.error(`Error fetching logos from list ${listId} in set ${set}:`, error);
    throw error;
  }
}
