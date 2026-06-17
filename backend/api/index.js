import 'dotenv/config.js';
import app from '../src/app.js';
import connectDB from '../src/db/db.js';

// Connect to DB once (cached across serverless invocations)
let isConnected = false;

const connectOnce = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
};

// Vercel serverless handler — export a function, not app.listen()
export default async function handler(req, res) {
    await connectOnce();
    return app(req, res);
}
