/* eslint-disable no-unused-vars */
import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import authenticate from '../middlewares/authentication';

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

  // File Management
  api.post('/files', authenticate, FilesController.postUpload);
};

export default router;
