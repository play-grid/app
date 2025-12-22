import createRouter from '@/lib/create-router';
import {
  createQuestionsHandler,
  deleteQuestionsHandler,
  getQuestionsByIdHandler,
  listQuestionsHandler,
  updateQuestionsHandler,
} from './questions.handlers';
import {
  createQuestions,
  deleteQuestions,
  getQuestionsById,
  listQuestions,
  updateQuestions,
} from './questions.routes';

const router = createRouter()
  .openapi(listQuestions, listQuestionsHandler)
  .openapi(deleteQuestions, deleteQuestionsHandler)
  .openapi(getQuestionsById, getQuestionsByIdHandler)
  .openapi(createQuestions, createQuestionsHandler)
  .openapi(updateQuestions, updateQuestionsHandler);

export default router;
