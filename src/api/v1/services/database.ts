import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

const mongoDBUrl = process.env.MONGODB_URL;
if (!mongoDBUrl) { throw new Error("MONGODB_URL environment variable is not set.")};

const client = new MongoClient(mongoDBUrl, {
  serverApi: ServerApiVersion.v1,
});

export async function connectDatabase() {
  try {
    // Connect the client to the server
    await client.connect();

    // Send a ping to confirm a successful connection
    const pingResult = await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB. Ping result:", pingResult);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};
