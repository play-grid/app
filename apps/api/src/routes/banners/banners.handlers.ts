import type { ListActiveBannersRoute } from './banners.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, asc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { getDB } from '@/db';
import { banners } from '@/db/schema';

export const listActiveBannersHandler: AppRouteHandler<
  ListActiveBannersRoute
> = async (c) => {
  const db = getDB(c);
  const now = new Date();

  const data = await db
    .select({
      id: banners.id,
      titleEn: banners.titleEn,
      titleAr: banners.titleAr,
      descriptionEn: banners.descriptionEn,
      descriptionAr: banners.descriptionAr,
      imageUrl: banners.imageUrl,
      linkUrl: banners.linkUrl,
      position: banners.position,
    })
    .from(banners)
    .where(
      and(
        eq(banners.isActive, true),
        or(isNull(banners.startDate), gte(banners.startDate, now)),
        or(isNull(banners.endDate), lte(banners.endDate, now)),
      ),
    )
    .orderBy(asc(banners.position));

  return c.json(data);
};
