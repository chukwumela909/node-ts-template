import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors'

import taskRoutes from './routes/taskRoutes';
import catchAll404Errors from './middlewares/catchAll404Errors';
import globalErrorHandler from './middlewares/errorHandler';
import { healthCheck } from './utils/health';
import { connectToDatabase } from './configs/dbConfig';

const app = express();

connectToDatabase();


// Middleware
app.use(cors())
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

// Error handlers
app.use(catchAll404Errors); // Catch all 404 errors...

app.use(globalErrorHandler); // Catch all errors...

export default app;
