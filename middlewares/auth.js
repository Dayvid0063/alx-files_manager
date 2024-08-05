import { ObjectId } from 'mongodb';
// eslint-disable-next-line import/no-named-as-default
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { handleError, errorMessages } from '../helper/errorHandler';

// eslint-disable-next-line import/prefer-default-export, consistent-return
export const authenticateUser = async (req, res, next) => {
  const token = req.header('X-Token');
  if (!token) {
    return handleError(res, 401, errorMessages.unauthorized);
  }

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return handleError(res, 401, errorMessages.unauthorized);
  }

  const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
  if (!user) {
    return handleError(res, 401, errorMessages.unauthorized);
  }

  req.user = user;
  next();
};
