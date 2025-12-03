import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * ⚠️ IMPORTANT: This contract is for SERVER-SIDE use only!
 *
 * In oRPC architecture:
 * - SERVER: Uses this contract to define and implement endpoints
 * - CLIENT: Only needs the transport link (WebSocket/HTTP)
 *
 * The client doesn't import or use this contract directly.
 * Instead, it creates a client with just the link:
 *
 *   const client = createORPCClient(link)
 *
 * The client automatically gets typed methods that match
 * what the server implements based on this contract.
 */

/**
 * Base contract that all games must implement.
 * Uses generic schemas that each game provides.
 *
 * This defines the API shape for:
 * - Client → Server: dispatchAction, syncState, ping
 * - Server → Client: onStateUpdate (streaming)
 */
export function createGameContract<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
>(schemas: {
  stateSchema: TStateSchema;
  actionSchema: TActionSchema;
}) {
  const contract = {
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
     * This creates a persistent connection that pushes state changes
     */
    onStateUpdate: oc.output(schemas.stateSchema),

    /**
     * Client → Server: Request full state sync
     * Useful for reconnection scenarios
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
  } as const;

  return contract;
}

/**
 * Type helper to infer contract from game schemas
 * Mainly used for server-side typing
 */
export type GameContract<
  TStateSchema extends z.ZodType,
  TActionSchema extends z.ZodType,
> = ReturnType<typeof createGameContract<TStateSchema, TActionSchema>>;
