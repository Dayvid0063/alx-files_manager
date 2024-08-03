/* eslint-disable import/no-named-as-default */
import redisClient from '../utils/redis';

const verifyToken = async (req, res, next) => {
  const token = req.header('X-Token');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.userId = userId;
  next();

  // Return undefined to satisfy consistent-return rule
  return undefined;
};

export default verifyToken;
