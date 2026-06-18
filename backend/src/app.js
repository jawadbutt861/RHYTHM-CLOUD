import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import musicRoutes from './routes/music.routes.js';
import userRoutes from './routes/user.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve the built frontend (Vite build output)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/users', userRoutes);

// SPA fallback: any non-API GET request gets index.html
// (Express 5 needs a regex or named wildcard instead of bare '*')
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global Error Handler Middleware
app.use(errorHandler);


export default app;
