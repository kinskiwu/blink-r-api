import app from './server';
import "dotenv/config";
import { connectDatabase } from './api/v1/services/database';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  // connect to database
  await connectDatabase();

  // start listening to port
  const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

  // listen for SIGINT signal (e.g. Ctrl+C) to shun down server
  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing MongoDB connection');
    // close database connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    // close server
    server.close(() => {
        console.log('Server shut down successfully.');
        process.exit(0);
    });
  });
}

// only start server in non-test environment to avoid conflicts during testing
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
}
