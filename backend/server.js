import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/db/db.js';

// connectDB returns a promise — we attach it to the app so Vercel's
// handler waits for the DB before serving the first request
const dbReady = connectDB();

// Wrap the express app to ensure DB is connected before handling requests
const handler = async (req, res) => {
    await dbReady;
    app(req, res);
};

// Local dev only
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    dbReady.then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
}

export default handler;
