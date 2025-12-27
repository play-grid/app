import type { z } from 'zod';

import { categoryBaseSchema } from '@guess-logo/five-seconds';

export const gameCategorySchema = categoryBaseSchema.describe('Game Category');

export type GameCategory = z.infer<typeof gameCategorySchema>;
