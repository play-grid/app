import { z } from 'zod';

/**
 * Base contract helper.
 * This file is kept minimal to help TypeScript inference for Game Definitions,
 * but it no longer defines runtime RPC routes.
 */

export function createGameContract<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
>(schemas: {
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
}) {
  return {
    stateSchema: schemas.stateSchema,
    actionSchema: schemas.actionSchema,
    // We export the shapes for the client to use in type generation if needed
    shapes: {
      dispatchAction: z.object({
        action: schemas.actionSchema,
        requestId: z.string().optional(),
      }),
      onStateUpdate: schemas.stateSchema,
    },
  } as const;
}

export type GameContract<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> = ReturnType<typeof createGameContract<TStateSchema, TActionSchema>>;
