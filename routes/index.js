/* eslint-disable no-unused-vars */
import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import { authMiddleware, basicAuth } from '../middleware/authenticate';
import { APIError, errorResponse } from '../middleware/errorHandler';

const router = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

  api.post('/users', UsersController.postNew);
  api.get('/users/me', authMiddleware, UsersController.getMe);

  api.get('/connect', basicAuth, AuthController.getConnect);
  api.get('/disconnect', authMiddleware, AuthController.getDisconnect);

  api.post('/files', authMiddleware, FilesController.postUpload);
  api.get('/files/:id', authMiddleware, FilesController.getShow);
  api.get('/files', authMiddleware, FilesController.getIndex);
  api.put('/files/:id/publish', authMiddleware, FilesController.putPublish);
  api.put('/files/:id/unpublish', authMiddleware, FilesController.putUnpublish);
  api.get('/files/:id/data', FilesController.getFile);

  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });
  api.use(errorResponse);
};

export default router;
