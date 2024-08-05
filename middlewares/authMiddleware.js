/* eslint-disable import/prefer-default-export */
import { getUserFromToken } from '../utils/dbUtils';

// eslint-disable-next-line consistent-return
export const authMiddleware = (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
};
