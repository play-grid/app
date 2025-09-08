import createRouter from '../../lib/create-router';
import { getGameTypesHandler } from './game-type.handlers';
import { getGameTypes } from './game-type.routes';

const router = createRouter().openapi(getGameTypes, getGameTypesHandler);

export default router;
