import express from 'express';
import routes from './routes/index';

const app = express();

// Load routes
routes(app);

export default app;
