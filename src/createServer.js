// Import necessary modules
import express from 'express';
import 'dotenv/config';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import cors from 'cors';
// Function to create the Express server
export const createServer = () => {
  const app = express();

  // Middleware to parse JSON
  app.use(express.json());
  app.use(cors({
    origin: process.env.CLIENT_HOST,
    credentials: true
  }));
  // Use routes for the respective paths
  app.use('/rooms', roomRoutes);
  app.use('/messages', messageRoutes);
  app.use('/users', userRoutes);

  return app;
};

// Export the createServer function
export default { createServer };
