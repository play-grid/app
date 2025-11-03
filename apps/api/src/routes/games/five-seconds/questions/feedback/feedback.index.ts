import createRouter from '@/lib/create-router';
import { createFeedbackHandler } from './feedback.handlers';
import { createFeedback } from './feedback.routes';

const router = createRouter()
  .openapi(createFeedback, createFeedbackHandler);

export default router;
