import createRouter from '@/lib/create-router';
import * as handlers from './questions.handlers';
import * as routes from './questions.routes';

const router = createRouter()
  .openapi(routes.listQuestions, handlers.listQuestionsHandler)
  .openapi(routes.deleteQuestions, handlers.deleteQuestionsHandler)
  .openapi(routes.getQuestionsById, handlers.getQuestionsByIdHandler)
  .openapi(routes.createQuestions, handlers.createQuestionsHandler)
  .openapi(routes.updateQuestions, handlers.updateQuestionsHandler);

export default router;
