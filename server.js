import express from 'express';
import startapp from './dir/startapp';
import Middlewares from './dir/middlewares';
import router from './routes';

const server = express();

Middlewares(server);
router(server);
startapp(server);

export default server;
