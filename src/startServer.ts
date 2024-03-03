import app from './server';
import 'dotenv/config';
import { connectDatabase } from './api/v1/database/connectDatabase';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 4000;
/**
 * Initialize and start the application server
 */
const startServer = async () => {
  await connectDatabase();

  const server = app.listen(PORT, () =>
    console.log(`Listening on port ${PORT}`)
  );

  // handle server shutdown with SIGINT signal (e.g Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing MongoDB connection');

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');

    server.close(() => {
      console.log('Server shut down successfully.');
      process.exit(0);
    });
  });
};

// prevent server initialization during test runs to avoid jest conflicts
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
}
