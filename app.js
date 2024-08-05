import express from 'express';
import router from './routes/index';
import errorHandler from './middlewares/errorHandler';
import authenticate from './middlewares/authentication';

const app = express();

app.use(express.json());
router(app);
app.use(errorHandler);
app.use(authenticate);

export default app;
