import createRouter from '@/lib/create-router';
import { createFeedbackHandler, getFeedbackTypesHandler } from './feedback.handlers';
import { createFeedback, getFeedbackTypes } from './feedback.routes';

const router = createRouter()
  .openapi(createFeedback, createFeedbackHandler)
  .openapi(getFeedbackTypes, getFeedbackTypesHandler);

export default router;
