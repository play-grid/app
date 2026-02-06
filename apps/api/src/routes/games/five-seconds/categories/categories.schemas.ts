import type { z } from 'zod';

import { categoryBaseSchema } from '@guess-logo/shared/schemas';

export const gameCategorySchema = categoryBaseSchema.describe('Game Category');

export type GameCategory = z.infer<typeof gameCategorySchema>;
