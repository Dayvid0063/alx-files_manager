import { MongoClient } from 'mongodb';
import Load from './dotenv';

class DBClient {
  constructor() {
    Load();

    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const link = `mongodb://${host}:${port}`;

    this.client = new MongoClient(link, { useUnifiedTopology: true });
    this.db = null;

    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        console.log('Successfully connected to MongoDB');
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
      });
  }

  isAlive() {
    return this.db !== null;
  }
}

const dbClient = new DBClient();
export default dbClient;
