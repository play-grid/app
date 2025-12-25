import createRouter from '@/lib/create-router';
import * as handlers from './categories.handlers';
import * as routes from './categories.routes';

const router = createRouter()
  .openapi(routes.getCategoriesById, handlers.getCategoriesByIdHandler)
  .openapi(routes.listCategories, handlers.listCategoriesHandler);

export default router;
