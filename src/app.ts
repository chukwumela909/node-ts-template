import express, { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';

import taskRoutes from './routes/taskRoutes';
import catchAll404Errors from './middlewares/catchAll404Errors';
import globalErrorHandler from './middlewares/errorHandler';
import { healthCheck } from './utils/health';
import { connectToDatabase } from './configs/dbConfig';
import { rateLimiter } from './configs/rateLimitConfig';

import './configs/sentryConfig';

const app = express();

// connect to DB
connectToDatabase();

// Rate limiting - Apply to all requests
app.use(rateLimiter);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({
    status: 'success',
    message: 'Api is live',
  });
});

app.use('/health', healthCheck);
app.use('/api/v1/tasks', taskRoutes);

app.get('/debug-sentry', (req, res) => {
  throw new Error('My first Sentry error!');
});

// Test rate limiting endpoint
app.get('/test-rate-limit', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Rate limiting test endpoint',
    timestamp: new Date().toISOString(),
    ip: req.ip,
    rateLimitInfo: {
      remaining: res.getHeader('X-RateLimit-Remaining'),
      limit: res.getHeader('X-RateLimit-Limit'),
      reset: res.getHeader('X-RateLimit-Reset'),
    },
  });
});

// Error handlers
Sentry.setupExpressErrorHandler(app); // sentry error handler middleware

app.use(catchAll404Errors); // Catch all 404 errors...

app.use(globalErrorHandler); // Catch all errors...

export default app;
