/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { getAuthUser, getTokenUser } from '../utils/authUtils';

/**
 * @param {NextFunction} next
 * @param {Request} req
 * @param {Response} res
 */

export const basicAuth = async (req, res, next) => {
  const user = await getAuthUser(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

/**
 * @param {NextFunction} next
 * @param {Request} req
 * @param {Response} res
 */

export const authMiddleware = async (req, res, next) => {
  const user = await getTokenUser(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};
