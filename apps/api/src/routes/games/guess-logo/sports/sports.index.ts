import createRouter from '@/lib/create-router';
import * as handlers from './sports.handlers';
import * as routes from './sports.routes';

const router = createRouter()
  .openapi(routes.getSportRegions, handlers.getSportRegions)
  .openapi(routes.getSportLeagues, handlers.getSportLeagues)
  .openapi(routes.getAllSportTeamsInRegion, handlers.getAllSportTeamsInRegion)
  .openapi(routes.getSportTeams, handlers.getSportTeams);

export default router;
