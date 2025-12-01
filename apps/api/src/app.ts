import { registerRoutes } from '@/routes';
import configureOpenAPI from './lib/configure-open-api';
import createApp from './lib/create-app';
import './games';

const app = registerRoutes(createApp());
configureOpenAPI(app);

export { GameSessionObject } from './durable-objects/game-session/game-session.object';

export default {
  fetch: app.fetch,
};
