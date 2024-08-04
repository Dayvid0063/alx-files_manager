import express from 'express';
import startapp from './dir/startapp';
import Middlewares from './dir/middlewares';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';

const server = express();

Middlewares(server);
router(server);
startapp(server);

server.use(errorHandler);

export default server;
