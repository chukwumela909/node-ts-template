# Important Modules - Node.js API Template

A modern Node.js API template built with TypeScript, Express, and MongoDB using functional programming patterns.

## Features

- ✅ **TypeScript** - Full type safety
- ✅ **Express.js** - Fast web framework
- ✅ **MongoDB with Mongoose** - NoSQL database integration
- ✅ **Functional Programming** - No class components, pure functions
- ✅ **Error Handling** - Centralized error handling with `catchAsync` and `http-errors`
- ✅ **Health Check** - Server and database monitoring endpoint
- ✅ **ESLint & Prettier** - Code formatting and linting
- ✅ **Hot Reload** - Development server with nodemon

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server (builds first, then runs)
npm run prod

# Or run production manually:
# npm run build
# npm start

# Run linting
npm run lint
```

## API Endpoints

### Health Check

- `GET /health` - Check server and database status

### Tasks API

- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/:id` - Get task by ID
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## Project Structure

```
src/
├── controllers/        # Request handlers
├── models/            # Database models (Mongoose schemas)
├── routes/            # Route definitions
├── utils/             # Utility functions (catchAsync, health)
├── configs/           # Configuration files
├── middlewares/       # Custom middleware
├── app.ts            # Express app setup
└── server.ts         # Server entry point
```

## Key Patterns

### Error Handling

All controllers use `catchAsync` wrapper and `http-errors` for consistent error handling:

```typescript
export const getTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(createError(404, 'Task not found'));
    }

    res.status(200).json({
      status: 'success',
      data: task,
    });
  },
);
```

### Database Models

Using Mongoose schemas with TypeScript interfaces (no classes):

```typescript
export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  completed: boolean;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String },
    description: { type: String, trim: true },
    completed: { type: Boolean },
  },
  { timestamps: true },
);
```

### Health Monitoring

Simple health check with readable uptime format:

```json
{
  "status": "success",
  "message": "Server is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": "2h 15m 30s",
  "database": "connected",
  "server": "online"
}
```

## Development

Perfect for developing scalable REST APIs!
