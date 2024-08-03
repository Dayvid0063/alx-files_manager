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

    // Connect to MongoDB
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

  async nbUsers() {
    if (!this.isAlive()) {
      return 0;
    }
    try {
      return await this.db.collection('users').countDocuments();
    } catch (err) {
      console.error('Failed to count users:', err);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) {
      return 0;
    }
    try {
      return await this.db.collection('files').countDocuments();
    } catch (err) {
      console.error('Failed to count files:', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
