/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { Request } from 'express';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './db';
import redisClient from './redis';

export const getAuthUser = async (req) => {
  const authorization = req.headers.authorization || null;

  if (!authorization) {
    return null;
  }
  const [scheme, credentials] = authorization.split(' ');

  if (scheme !== 'Basic' || !credentials) {
    return null;
  }

  const [email, password] = Buffer.from(credentials, 'base64').toString().split(':');
  if (!email || !password) {
    return null;
  }

  const user = await (await dbClient.usersCollection()).findOne({ email });
  if (!user || sha1(password) !== user.password) {
    return null;
  }

  return user;
};

export const getTokenUser = async (req) => {
  const token = req.headers['x-token'];

  if (!token) {
    return null;
  }

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return null;
  }

  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  return user || null;
};

export default {
  getAuthUser: async (req) => getAuthUser(req),
  getTokenUser: async (req) => getTokenUser(req),
};
