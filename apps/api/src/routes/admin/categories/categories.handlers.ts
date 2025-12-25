import type {
  GetCategoriesByIdRoute,
  ListCategoriesRoute,
} from './categories.routes';
import type { AppRouteHandler } from '@/lib/types';
import { sql } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';
import { fiveSecondsCategories } from '@/routes/games/five-seconds/five-seconds.tables';

// List Categories Handler
export const listCategoriesHandler: AppRouteHandler<
  ListCategoriesRoute
> = async (c) => {
  const db = getDB(c);
  const { page, limit } = c.req.valid('query');

  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(fiveSecondsCategories);

  const categories = await db
    .select({
      id: fiveSecondsCategories.id,
      nameEn: fiveSecondsCategories.nameEn,
      nameAr: fiveSecondsCategories.nameAr,
    })
    .from(fiveSecondsCategories)
    .orderBy(fiveSecondsCategories.createdAt)
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(count / limit);

  return c.json({
    data: categories,
    pagination: { page, limit, total: count, totalPages },
  });
};

// Get Categories by ID Handler
export const getCategoriesByIdHandler: AppRouteHandler<
  GetCategoriesByIdRoute
> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const category = await db.query.fiveSecondsCategories.findFirst({
    where: (cat, { eq }) => eq(cat.id, id),
  });

  if (!category) {
    return c.json(
      { error: 'Category not found' },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json({
    id: category.id,
    nameEn: category.nameEn,
    nameAr: category.nameAr,
  });
};
