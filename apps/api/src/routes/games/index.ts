import createRouter from '@/api/lib/create-router';
import { fiveSecondsRoutes } from './five-seconds';
import { guessLogoRoutes } from './guess-logo';

// Aggregate all game routes
export const gamesRoutes = createRouter()
  .route('/five-seconds', fiveSecondsRoutes)
  .route('/guess-logo', guessLogoRoutes);
