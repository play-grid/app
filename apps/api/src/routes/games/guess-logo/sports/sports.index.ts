import createRouter from '@/lib/create-router';
import * as handlers from './sports.handlers';
import * as routes from './sports.routes';

const router = createRouter()
  .openapi(routes.getSportRegions, handlers.getSportRegions)
  .openapi(routes.getAvailableCountries, handlers.getAvailableCountries)
  .openapi(routes.getCustomSportLists, handlers.getCustomSportLists)
  .openapi(routes.getAllSportTeamsInCountry, handlers.getAllSportTeamsInCountry)
  .openapi(routes.getSportTeamsInCustomList, handlers.getSportTeamsInCustomList)
  .openapi(routes.getSportLeagues, handlers.getSportLeagues)
  .openapi(routes.getAllSportTeamsInRegion, handlers.getAllSportTeamsInRegion)
  .openapi(routes.getSportTeams, handlers.getSportTeams);

export default router;
