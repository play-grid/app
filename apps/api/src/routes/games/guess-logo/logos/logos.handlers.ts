import type { LogoContent, LogoSetKey } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import type {
  GetLogoListsRoute,
  GetLogosBySetAndListRoute,
} from './logos.routes';
import type { AppRouteHandler } from '@/lib/types';
import { shuffleArray } from '@guess-logo/shared/utils';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { logger } from '@/utils/logger';
import { getLogoListsMetadata } from './data/metadata';
import { getLogoFetcher } from './data/registry';
import { applyLogoOverrides, getLogoOverrides } from './services/override.service';

export const getLogoLists: AppRouteHandler<GetLogoListsRoute> = (c) => {
  const set = c.req.valid('param').set as LogoSetKey;

  try {
    const logoLists = getLogoListsMetadata(set);
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

  try {
    const overrides = await getLogoOverrides();
    const overrideVersion = overrides._v || '';

    const cacheKey = `logos:full:${set}:${list}:${language}:${overrideVersion}`;

    let allLogos: LogoContent[];
    const cached = await c.env.LOGO_CACHE.get(cacheKey);

    if (cached) {
      allLogos = JSON.parse(cached);
    }
    else {
      const fetcher = getLogoFetcher(set, list);
      if (!fetcher) {
        return c.json({ error: 'Not found' }, HttpStatusCodes.NOT_FOUND);
      }

      const rawLogos = await fetcher(language as SupportedLanguage, c);

      allLogos = await applyLogoOverrides(rawLogos, set, list, overrides);

      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allLogos), {
        expirationTtl: 86400 * 7,
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

    c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
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
