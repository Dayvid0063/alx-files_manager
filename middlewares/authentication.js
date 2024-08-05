// eslint-disable-next-line import/no-named-as-default
import redisClient from '../utils/redis';

// eslint-disable-next-line consistent-return
const authenticate = async (req, res, next) => {
  const token = req.headers['x-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = await redisClient.get(token);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = { _id: userId };
  next();
};

export default authenticate;
