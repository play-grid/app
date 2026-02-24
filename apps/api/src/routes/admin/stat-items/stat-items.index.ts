import createRouter from '@/lib/create-router';
import * as handlers from './stat-items.handlers';
import * as routes from './stat-items.routes';

const router = createRouter()
  .openapi(routes.listStatItems, handlers.listStatItemsHandler)
  .openapi(routes.createStatItem, handlers.createStatItemHandler)
  .openapi(routes.getStatItemById, handlers.getStatItemByIdHandler)
  .openapi(routes.updateStatItem, handlers.updateStatItemHandler)
  .openapi(routes.deleteStatItem, handlers.deleteStatItemHandler)
  .openapi(routes.updateStatItemStatus, handlers.updateStatItemStatusHandler)
  .openapi(routes.bulkUpdateStatus, handlers.bulkUpdateStatusHandler);

export default router;
