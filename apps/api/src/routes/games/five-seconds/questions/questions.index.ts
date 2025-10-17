import createRouter from '@/api/lib/create-router';
import * as handlers from './questions.handlers';
import * as routes from './questions.routes';

export const fiveSecondsQuestionRoutes = createRouter()
  .openapi(routes.getRandomQuestion, handlers.getRandomQuestion);
