import createRouter from '@/lib/create-router';
import { listQuestionFeedbackHandler } from './question-feedback.handlers';
import { listQuestionFeedback } from './question-feedback.routes';

const router = createRouter().openapi(listQuestionFeedback, listQuestionFeedbackHandler);

export default router;
