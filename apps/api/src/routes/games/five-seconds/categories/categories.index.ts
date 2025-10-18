import createRouter from '@/api/lib/create-router';
import * as handlers from './categories.handlers';
import * as routes from './categories.routes';

export const fiveSecondsCategoryRoutes = createRouter()
  .openapi(routes.listCategories, handlers.listCategoriesHandler)
  .openapi(routes.getCategory, handlers.getCategoryHandler);
