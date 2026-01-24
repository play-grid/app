import createRouter from '@/lib/create-router';
import * as handlers from './banners.handlers';
import * as routes from './banners.routes';

const router = createRouter()
  .openapi(routes.listBanners, handlers.listBannersHandler)
  .openapi(routes.createBanner, handlers.createBannerHandler)
  .openapi(routes.getBannerById, handlers.getBannerByIdHandler)
  .openapi(routes.updateBanner, handlers.updateBannerHandler)
  .openapi(routes.deleteBanner, handlers.deleteBannerHandler);

export default router;
