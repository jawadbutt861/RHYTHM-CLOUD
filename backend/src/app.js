import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import authRouter from './routes/auth.route.js'
import musicRouter from './routes/music.route.js'
import userRouter from './routes/user.route.js'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import helmet from 'helmet'

const app = express()
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(morgan('combined'))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use(limiter)

app.use('/api/auth', authRouter)
app.use('/api/music', musicRouter)
app.use('/api/user', userRouter)
import errorHandler from './middlewares/error.middleware.js'

app.use(errorHandler)

// Serve frontend build in production with static assets
if (process.env.NODE_ENV === 'production') {
	const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist')
	app.use(express.static(clientDist))

	// SPA fallback - serve index.html for unknown GET routes
	app.get('*', (req, res) => {
		res.sendFile(path.join(clientDist, 'index.html'))
	})
}

export default app;