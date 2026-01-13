import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import app from './app';
import { connectDB } from './config/database';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`CORS allowed origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error | unknown) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  if (err instanceof Error) {
    console.error(err.name, err.message);
  } else {
    console.error(err);
  }
  server.close(() => {
    process.exit(1);
  });
});
