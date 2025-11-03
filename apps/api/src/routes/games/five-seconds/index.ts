import createRouter from '@/lib/create-router';
import { fiveSecondsCategoryRoutes } from './categories/categories.index';
import feedback from './questions/feedback/feedback.index';
import { fiveSecondsQuestionRoutes } from './questions/questions.index';

export const fiveSecondsRoutes = createRouter()
  .route('/categories', fiveSecondsCategoryRoutes)
  .route('/questions', fiveSecondsQuestionRoutes)
  .route('/questions/feedback', feedback);
