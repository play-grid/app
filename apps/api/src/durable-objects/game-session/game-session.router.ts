import type { GameSessionManager } from './game-session.manager';
import { os } from '@orpc/server';
import { HibernationEventIterator } from '@orpc/server/hibernation';
import { z } from 'zod';

/**
 * Context with native Cloudflare WebSocket (server-side)
 */
interface GameSessionContext {
  ws: WebSocket;
  getWebSockets: () => WebSocket[];
  manager: GameSessionManager;
}

export function createGameSessionRouter(
  actionSchema: z.ZodType,
  stateSchema: z.ZodType,
) {
  const base = os.$context<GameSessionContext>();

  return {
    dispatchAction: base
      .input(
        z.object({
          action: actionSchema,
          requestId: z.string().optional(),
        }),
      )
      .output(
        z.object({
          success: z.boolean(),
          error: z.string().optional(),
        }),
      )
      .handler(async ({ input, context }) => {
        try {
          // Action already validated by Zod, manager will re-validate
          context.manager.dispatchAction(input.action);

          return { success: true };
        }
        catch (error) {
          console.error('[GameSessionRouter] dispatchAction error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),

    onStateUpdate: base.output(stateSchema).handler(async ({ context }) => {
      return new HibernationEventIterator<any>((id) => {
        context.ws.serializeAttachment({ stateIteratorId: id });

        // Send initial state
        context.ws.send(
          JSON.stringify({
            type: 'state',
            data: context.manager.getState(),
          }),
        );
      });
    }),

    syncState: base.output(stateSchema).handler(async ({ context }) => {
      return context.manager.getState();
    }),

    ping: base
      .output(z.object({ timestamp: z.number() }))
      .handler(async () => ({ timestamp: Date.now() })),
  };
}

export type GameSessionRouter = ReturnType<typeof createGameSessionRouter>;
