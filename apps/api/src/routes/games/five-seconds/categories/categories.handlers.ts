import type { getCategory, listCategories } from './categories.routes';
import type { AppRouteHandler } from '@/api/lib/types';
import { languageQuery } from '@guess-logo/shared/schemas';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import categories from './categories.json';

export const listCategoriesHandler: AppRouteHandler<typeof listCategories> = async (c) => {
  const query = languageQuery.parse(c.req.query());
  const { language } = query; // now typed as 'en' | 'ar'

  const localizedCategories = categories.map(cat => ({
    ...cat,
    name: cat.name[language],
  }));

  return c.json(localizedCategories, HttpStatusCodes.OK);
};

export const getCategoryHandler: AppRouteHandler<typeof getCategory> = async (c) => {
  const { id } = c.req.param();
  const { language } = languageQuery.parse(c.req.query());

  const category = categories.find(cat => cat.id === id);

  if (!category) {
    return c.json({ error: 'Category not found' }, HttpStatusCodes.NOT_FOUND);
  }

  const localizedCategory = {
    ...category,
    name: category.name[language] || category.name.en, // fallback
  };

  return c.json(localizedCategory, HttpStatusCodes.OK);
};
