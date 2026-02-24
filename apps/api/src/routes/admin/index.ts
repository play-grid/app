import createRouter from '@/lib/create-router';
import banners from './banners/banners.index';
import categories from './categories/categories.index';
import questionFeedback from './question-feedback/question-feedback.index';
import questions from './questions/questions.index';
import statItems from './stat-items/stat-items.index';

export const adminRoutes = createRouter()
  .route('/banners', banners)
  .route('/question-feedback', questionFeedback)
  .route('/questions', questions)
  .route('/categories', categories)
  .route('/stat-items', statItems);
