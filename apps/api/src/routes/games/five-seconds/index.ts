import createRouter from '@/api/lib/create-router';
import { fiveSecondsCategoryRoutes } from './categories/categories.index';

// Aggregate all five-seconds game routes
export const fiveSecondsRoutes = createRouter()
  .route('/categories', fiveSecondsCategoryRoutes);
