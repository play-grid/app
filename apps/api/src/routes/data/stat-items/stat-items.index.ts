import createRouter from '@/lib/create-router';
import * as handlers from './stat-items.handlers';
import * as routes from './stat-items.routes';

const router = createRouter()
  .openapi(routes.getStatItems, handlers.getStatItemsHandler);

export default router;
