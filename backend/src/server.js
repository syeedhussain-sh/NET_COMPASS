import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development prototyping
    },
    credentials: true,
  })
);

// Standard JSON parsing
app.use(express.json());

// Request logger for dev transparency
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(` Network Compass Backend Server`);
  console.log(` Listening on: http://localhost:${config.port}`);
  console.log(` Health Check: http://localhost:${config.port}/api/health`);
  console.log(` Environment : ${config.nodeEnv}`);
  console.log(`===============================================`);
});

export default app;
