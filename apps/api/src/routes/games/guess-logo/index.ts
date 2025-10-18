import createRouter from '@/api/lib/create-router';
import logos from './logos/logos.index';

// Aggregate all guess-logo game routes
export const guessLogoRoutes = createRouter()
  .route('/logos', logos);
