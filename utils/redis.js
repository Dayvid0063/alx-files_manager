import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;

    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      this.isClientConnected = true;
    });

    // Promisify the Redis commands for backwards compatibility
    this.getAsync = promisify(this.client.GET).bind(this.client);
    this.setexAsync = promisify(this.client.SETEX).bind(this.client);
    this.delAsync = promisify(this.client.DEL).bind(this.client);
  }

  isAlive() {
    return this.isClientConnected;
  }

  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (err) {
      console.error('Error getting value from Redis:', err);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.setexAsync(key, duration, value);
    } catch (err) {
      console.error('Error setting value in Redis:', err);
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
    } catch (err) {
      console.error('Error deleting value from Redis:', err);
    }
  }
}

export const redisClient = new RedisClient();
export default redisClient;
