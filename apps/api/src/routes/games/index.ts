import createRouter from '@/lib/create-router';
import { fiveSecondsRoutes } from './five-seconds';
import * as gamesHandlers from './games.handlers';
import * as gamesListRoutes from './games.routes';
import { guessLogoRoutes } from './guess-logo';

// Aggregate all game routes
export const gamesRoutes = createRouter()
  .openapi(gamesListRoutes.listGamesMeta, gamesHandlers.listGamesHandler)
  .route('/five-seconds', fiveSecondsRoutes)
  .route('/guess-logo', guessLogoRoutes);
