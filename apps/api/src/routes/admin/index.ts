import createRouter from '@/lib/create-router';
import categories from './categories/categories.index';
import questionFeedback from './question-feedback/question-feedback.index';
import questions from './questions/questions.index';

export const adminRoutes = createRouter()
  .route('/questions', questions)
  .route('/categories', categories)
  .route('/question-feedback', questionFeedback);
