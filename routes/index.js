/* eslint-disable no-unused-vars */
import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';

/**
 * @param {Express} api
 */

const router = (api) => {
  // Status and Stats
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

  // Users
  api.post('/users', UsersController.postNew);
  api.get('/users/me', UsersController.getMe);

  // Authentication
  api.get('/connect', AuthController.getConnect);
  api.get('/disconnect', AuthController.getDisconnect);

  api.post('/files', authMiddleware, validationMiddleware, FilesController.postUpload);
};

export default router;
