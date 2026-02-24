import createRouter from '@/lib/create-router';
import statItems from './stat-items/stat-items.index';

export const dataRoutes = createRouter()
  .route('/stat-items', statItems);
