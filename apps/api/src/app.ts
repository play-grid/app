import { registerRoutes } from '@/routes';
import configureOpenAPI from './lib/configure-open-api';
import createApp from './lib/create-app';

const app = registerRoutes(createApp());
configureOpenAPI(app);

export { GameRoomDurableObject } from './lib/game-room.do';

export default {
  fetch: app.fetch,
};
