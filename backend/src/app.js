import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import musicRoutes from './routes/music.routes.js';
import userRoutes from './routes/user.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

// CORS — allow the frontend origin, required for httpOnly cookie auth cross-origin
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true, // Needed so cookies are sent with cross-origin requests
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
