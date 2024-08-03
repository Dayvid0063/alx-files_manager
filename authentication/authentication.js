import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
// eslint-disable-next-line import/no-named-as-default
import redisClient from '../utils/redis';

const Auth = {
  async generateToken(userId) {
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, userId, 86400);
    return token;
  },

  async getUserIdByToken(token) {
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    return userId;
  },

  async deleteUserToken(token) {
    const key = `auth_${token}`;
    await redisClient.del(key);
  },

  async verifyCredentials(email, password) {
    const hashedPassword = sha1(password);
    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
    return user;
  },
};

export default Auth;
