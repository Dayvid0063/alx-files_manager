/* eslint-disable no-unused-vars */
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import verifyToken from '../middleware/VerifyToken';

const router = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

  api.post('/users', UsersController.postNew);
  api.get('/users/me', verifyToken, UsersController.getMe);

  api.get('/connect', AuthController.getConnect);
  api.get('/disconnect', verifyToken, AuthController.getDisconnect);

  api.post('/files', verifyToken, FilesController.postUpload);
};

export default router;
