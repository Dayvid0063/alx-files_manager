/* eslint-disable no-unused-vars */
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import { APIError, errorResponse } from '../middleware/errorHandler';
import { basicAuthMiddleware, xTokenAuthMiddleware } from '../middleware/authenticate';

const router = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

  api.post('/users', UsersController.postNew);
  api.get('/users/me', xTokenAuthMiddleware, UsersController.getMe);

  api.get('/connect', basicAuthMiddleware, AuthController.getConnect);
  api.get('/disconnect', xTokenAuthMiddleware, AuthController.getDisconnect);

  api.post('/files', xTokenAuthMiddleware, FilesController.postUpload);
  api.get('/files/:id', xTokenAuthMiddleware, FilesController.getShow);
  api.get('/files', xTokenAuthMiddleware, FilesController.getIndex);
  api.put('/files/:id/publish', xTokenAuthMiddleware, FilesController.putPublish);
  api.put('/files/:id/unpublish', xTokenAuthMiddleware, FilesController.putUnpublish);
  api.get('/files/:id/data', FilesController.getFile);

  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });
  api.use(errorResponse);
};

export default router;
