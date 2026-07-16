import createRouter from '@/lib/create-router';
import * as handlers from './companies.handlers';
import * as routes from './companies.routes';

const router = createRouter()
  .openapi(routes.listCompanies, handlers.listCompaniesHandler)
  .openapi(routes.createCompany, handlers.createCompanyHandler)
  .openapi(routes.getCompanyById, handlers.getCompanyByIdHandler)
  .openapi(routes.updateCompany, handlers.updateCompanyHandler)
  .openapi(routes.deleteCompany, handlers.deleteCompanyHandler)
  .openapi(routes.syncCompanyLogo, handlers.syncCompanyLogoHandler);

export default router;
