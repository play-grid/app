/* eslint-disable perfectionist/sort-imports */
import './games';
import '@playgrid/five-seconds';
import '@playgrid/guess-logo';
import '@playgrid/stat-clash';
import { registerRoutes } from '@/routes';
import configureOpenAPI from './lib/configure-open-api';
import createApp from './lib/create-app';

const app = registerRoutes(createApp());
configureOpenAPI(app);

export { GameSessionObject } from './durable-objects/game-session/game-session.object';

export default {
  fetch: app.fetch,
};
