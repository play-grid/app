import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Base contract that all games must implement.
 * Uses generic schemas that each game provides.
 *
 * NOTE: Contracts define the API shape, NOT the implementation.
 * Implementation happens on the server side.
 */
export function createGameContract<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
>(schemas: {
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
}) {
  return {
    /**
     * Client → Server: Dispatch a game action
     */
    dispatchAction: oc
      .input(
        z.object({
          action: schemas.actionSchema,
          requestId: z.string().optional(),
        }),
      )
      .output(
        z.object({
          success: z.boolean(),
          error: z.string().optional(),
        }),
      ),

    /**
     * Server → Client: Stream game state updates
     */
    onStateUpdate: oc.output(schemas.stateSchema),

    /**
     * Client → Server: Request full state sync
     */
    syncState: oc.output(schemas.stateSchema),

    /**
     * Client → Server: Ping to check connection
     */
    ping: oc.output(
      z.object({
        timestamp: z.number(),
      }),
    ),
  };
}

/**
 * Type helper to infer contract from game schemas
 */
export type GameContract<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> = ReturnType<typeof createGameContract<TStateSchema, TActionSchema>>;
