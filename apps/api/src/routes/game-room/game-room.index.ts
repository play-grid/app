import createRouter from '../../lib/create-router';
import * as handlers from './game-room.handlers';
import * as routes from './game-room.routes';

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.join, handlers.join)
  .openapi(routes.websocketUpgrade, handlers.websocketUpgrade)
  .openapi(routes.getRoomStats, handlers.getGameRoomStats)
  .openapi(routes.generateInvite, handlers.generateInvite)
  .openapi(routes.validateInvite, handlers.validateInvite)
  .openapi(routes.revokeInvite, handlers.revokeInvite);

export default router;
