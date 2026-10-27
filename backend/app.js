import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.js';
import buildingsRouter from './routes/buildings.js';
import classroomsRouter from './routes/classrooms.js';
import routesRouter from './routes/routes.js';
import searchRouter from './routes/search.js';
import nodesRouter from './routes/nodes.js';
import edgesRouter from './routes/edges.js';
import locationsRouter from './routes/locations.js';
import navigationRouter from './routes/navigation.js';
import chatRouter from './routes/chat.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const CORS_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

// Make sure the DB is connected before any route runs (reused after the first call)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/buildings', buildingsRouter);
app.use('/api/classrooms', classroomsRouter);
app.use('/api/routes', routesRouter);
app.use('/api/search', searchRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/edges', edgesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/chat', chatRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'find-my-class-api' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
