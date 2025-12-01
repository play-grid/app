import createRouter from '@/lib/create-router';
import * as handlers from './game-types.handlers';
import * as routes from './game-types.routes';

const router = createRouter().openapi(
  routes.listGameTypes,
  handlers.listGameTypesHandler,
);

export default router;
