import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import path from 'path';
import dotenv from 'dotenv';

// Determine the path based on NODE_ENV
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(process.cwd(), dotenvPath);
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri ? uri : '', {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbConnection: Promise<Db>;

export const connectToDatabase = async (): Promise<Db> => {

  
  if (!dbConnection) {
    dbConnection = client.connect().then(client => {
      return client.db("insiderhood");
    });
  }
  return dbConnection;
};