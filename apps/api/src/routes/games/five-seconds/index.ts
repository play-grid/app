import createRouter from '@/lib/create-router';
import { fiveSecondsCategoryRoutes } from './categories/categories.index';
import { fiveSecondsQuestionRoutes } from './questions/questions.index';

export const fiveSecondsRoutes = createRouter()
  .route('/categories', fiveSecondsCategoryRoutes)
  .route('/questions', fiveSecondsQuestionRoutes);
