import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import musicRoutes from './routes/music.routes.js';
import userRoutes from './routes/user.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Frontend build output lives at backend/public (built by Vite)
const publicDir = path.resolve(__dirname, '../../public');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/users', userRoutes);

// Global error handler (must be before static/catch-all)
app.use(errorHandler);

// Serve the Vite-built frontend
app.use(express.static(publicDir));

// Catch-all: return index.html for any non-API path so React Router works
app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

export default app;
