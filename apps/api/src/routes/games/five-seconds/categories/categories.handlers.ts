// apps/api/src/routes/games/five-seconds/categories/categories.handlers.ts
import type { getCategory, listCategories } from './categories.routes';
import type { AppRouteHandler } from '@/lib/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';

export const listCategoriesHandler: AppRouteHandler<typeof listCategories> = async (c) => {
  const db = getDB(c);
  const categories = await db.query.fiveSecondsCategories.findMany();

  return c.json(
    categories.map(cat => ({
      id: cat.id,
      nameEn: cat.nameEn,
      nameAr: cat.nameAr,
    })),
    HttpStatusCodes.OK,
  );
};

export const getCategoryHandler: AppRouteHandler<typeof getCategory> = async (c) => {
  const { id } = c.req.param();

  const db = getDB(c);
  const category = await db.query.fiveSecondsCategories.findFirst({
    where: (cat, { eq }) => eq(cat.id, id),
  });

  if (!category) {
    return c.json(
      { error: 'Category not found' },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    {
      id: category.id,
      nameEn: category.nameEn,
      nameAr: category.nameAr,
    },
    HttpStatusCodes.OK,
  );
};
