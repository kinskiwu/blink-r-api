import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

const mongoDBUrl = process.env.MONGODB_URL;
if (!mongoDBUrl) { throw new Error("MONGODB_URL environment variable is not set.")};

const client = new MongoClient(mongoDBUrl, {
  serverApi: ServerApiVersion.v1,
});

export const connectDatabase = async () => {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    // log error & throw error
    console.error('Error connecting to MongoDB:', err);
    throw new Error('Failed to connect to MongoDB');
  }
  // always return mongoclient
  return client;
};
