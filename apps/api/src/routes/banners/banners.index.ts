import createRouter from '@/lib/create-router';
import * as handlers from './banners.handlers';
import * as routes from './banners.routes';

const router = createRouter()
  .openapi(routes.listActiveBanners, handlers.listActiveBannersHandler);

export default router;
