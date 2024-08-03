/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { getAuthUser, getTokenUser } from '../utils/authUtils';

export const basicAuthMiddleware = async (req, res, next) => {
  const user = await getAuthUser(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

export const xTokenAuthMiddleware = async (req, res, next) => {
  const user = await getTokenUser(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};
