import type { CreateFeedbackRoute, GetFeedbackTypesRoute } from './feedback.routes';
import type { CreateFeedbackInput } from './schemas';
import type { AppRouteHandler } from '@/lib/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';
import { fiveSecondsFeedback } from '@/routes/games/five-seconds/five-seconds.tables';
import { logger } from '@/utils/logger';
import { feedbackTypes } from './types';

export const getFeedbackTypesHandler: AppRouteHandler<GetFeedbackTypesRoute> = async (c) => {
  return c.json([...feedbackTypes]);
};

export const createFeedbackHandler: AppRouteHandler<CreateFeedbackRoute> = async (c) => {
  const db = getDB(c);
  const input: CreateFeedbackInput = c.req.valid('json');

  try {
    // Insert the validated data into the database
    // .returning() gives us the newly created record back
    const newFeedback = await db
      .insert(fiveSecondsFeedback)
      .values({
        ...input,
      })
      .returning();

    // Check if the insert was successful
    if (!newFeedback || newFeedback.length === 0) {
      return c.json(
        { error: 'Failed to create feedback record' },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    // Return the full, created feedback object with a 201 status
    return c.json(newFeedback[0], HttpStatusCodes.CREATED);
  }
  catch (error: any) {
    logger.error(error, 'Error creating feedback:');

    // Handle specific, common errors
    if (error.message?.includes('FOREIGN KEY constraint')
      || error.cause?.message?.includes('FOREIGN KEY constraint')) {
      return c.json(
        { error: 'Invalid questionId. The question does not exist.' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Generic fallback error
    return c.json(
      { error: 'An unexpected error occurred' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
