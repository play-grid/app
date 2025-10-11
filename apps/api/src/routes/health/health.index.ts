import createRouter from '../../lib/create-router';
import * as handlers from './health.handlers';
import * as routes from './health.routes';

const router = createRouter().openapi(routes.health, handlers.getHealthStatus);

export default router;
