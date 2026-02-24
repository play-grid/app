import createRouter from '@/lib/create-router';
import * as handlers from './sync.handlers';
import * as routes from './sync.routes';

const router = createRouter()
  .openapi(routes.syncFootballPlayers, handlers.syncFootballPlayersHandler)
  .openapi(routes.syncFootballTeams, handlers.syncFootballTeamsHandler);

export default router;
