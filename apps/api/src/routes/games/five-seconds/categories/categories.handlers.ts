import type { getCategory, listCategories } from './categories.routes';
import type { AppRouteHandler } from '@/lib/types';
import { languageQuery } from '@guess-logo/shared/schemas';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';

export const listCategoriesHandler: AppRouteHandler<typeof listCategories> = async (c) => {
  const { language } = languageQuery.parse(c.req.query());

  const db = getDB(c);
  const categories = await db.query.fiveSecondsCategories.findMany();

  const localizedCategories = categories.map(cat => ({
    id: cat.id,
    name: language === 'ar' ? cat.nameAr : cat.nameEn,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  }));

  return c.json(localizedCategories, HttpStatusCodes.OK);
};

export const getCategoryHandler: AppRouteHandler<typeof getCategory> = async (c) => {
  const { id } = c.req.param();
  const { language } = languageQuery.parse(c.req.query());

  const db = getDB(c);
  const category = await db.query.fiveSecondsCategories.findFirst({
    where: (cat, { eq }) => eq(cat.id, id),
  });

  if (!category) {
    return c.json({ error: 'Category not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({
    id: category.id,
    name: language === 'ar' ? category.nameAr : category.nameEn,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }, HttpStatusCodes.OK);
};
