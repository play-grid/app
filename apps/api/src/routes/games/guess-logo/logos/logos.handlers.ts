import type { LogoContent, LogoSetKey } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type {
  GetLogoListsRoute,
  GetLogosBySetAndListRoute,
} from './logos.routes';
import type { AppRouteHandler } from '@/lib/types';
import { logoOverrides as rawOverrides } from '@guess-logo/shared/data';
import { shuffleArray } from '@guess-logo/shared/utils';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { logger } from '@/utils/logger';
import { fetchLogoLists } from './services/logo-lists-service';

interface LogoOverrides {
  _v: string;
  sets: Record<string, Record<string, Record<string, string>>>;
}

export const getLogoLists: AppRouteHandler<GetLogoListsRoute> = async (c) => {
  const set = c.req.valid('param').set as LogoSetKey;

  try {
    const logoLists = await fetchLogoLists(set);

    return c.json(logoLists, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, `Failed to fetch logo lists for set ${set}:`);
    return c.json(
      { error: 'Failed to fetch logo lists' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getLogosBySetAndList: AppRouteHandler<GetLogosBySetAndListRoute> = async (
  c,
) => {
  const { set, list } = c.req.valid('param');

  if (set === 'sports') {
    return c.json(
      { error: `'sports' is not a valid logo set. Please use the /sports endpoint.` },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  const { count, language, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);
  const logoOverrides = rawOverrides as LogoOverrides;

  const overrideVersion = logoOverrides._v || '';

  const fullDatasetCacheKey = `logos:full:${set}:${list}:${language}:${overrideVersion}`;

  try {
    let allLogos: LogoContent[];

    const cached = await c.env.LOGO_CACHE.get(fullDatasetCacheKey);

    if (cached) {
      allLogos = JSON.parse(cached);
    }
    else {
      const logos = await fetchLogosFromList(set, list, language as SupportedLanguage);

      allLogos = logos.map((logo) => {
        const overrideKey
          = logo.type === 'country' && logo.originalName
            ? logo.originalName
            : logo.name;

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

    let processedLogos: LogoContent[];

    if (shuffle === true) {
      const shuffledLogos = shuffleArray([...allLogos]);
      processedLogos = shuffledLogos.slice(0, countNum);
    }
    else {
      processedLogos = allLogos.slice(0, countNum);
    }

    return c.json(processedLogos, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, `Failed to fetch logos for set ${set}, list ${list}:`);
    return c.json(
      { error: 'Failed to fetch logos' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

async function fetchLogosFromList(
  set: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
): Promise<LogoContent[]> {
  try {
    const logoLists = await fetchLogoLists(set);

    const targetList = logoLists.find(list => list.id === listId);
    if (!targetList) {
      throw new Error(`List '${listId}' not found for set '${set}'`);
    }

    const logoItems = await targetList.fetchItems(language, listId);

    return logoItems;
  }
  catch (error) {
    logger.error(error, `Error fetching logos from list ${listId} in set ${set}:`);
    throw error;
  }
}
