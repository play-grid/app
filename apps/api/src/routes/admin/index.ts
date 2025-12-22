import createRouter from '@/lib/create-router';
import questions from './questions/questions.index';

export const adminRoutes = createRouter()
  .route('/questions', questions);
