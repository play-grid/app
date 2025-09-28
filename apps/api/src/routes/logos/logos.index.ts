import createRouter from '../../lib/create-router';
import * as handlers from './logos.handlers';
import * as routes from './logos.routes';

const router = createRouter()
  .openapi(routes.getLogoLists, handlers.getLogoLists)
  .openapi(routes.getLogosBySetAndList, handlers.getLogosBySetAndList);

export default router;
